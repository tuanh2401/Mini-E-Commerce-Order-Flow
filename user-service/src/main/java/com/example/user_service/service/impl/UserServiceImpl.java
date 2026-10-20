package com.example.user_service.service.impl;

import com.example.lib.model.dto.EmailVerificationEvent;
import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.BaseService;
import com.example.lib.service.MinioService;
import com.example.user_service.dto.request.SyncUserRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.entity.MembershipTier;
import com.example.user_service.entity.User;
import com.example.user_service.mapper.UserMapper;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
public class UserServiceImpl extends BaseService<UserRepository, UserResponse, User, UserMapper, Long> implements UserService {

    private final MinioService minioService;
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Autowired
    private com.example.user_service.client.AuthClient authClient;

    // constructor chỉ cần tiêm MinioService.
    // UserRepository và UserMapper đã được Spring tự động tiêm thông qua @Autowired ở BaseService cha.
    public UserServiceImpl(MinioService minioService) {
        this.minioService = minioService;
    }

//Đồng bộ tk từ auth-service
    @Override
    public UserResponse syncUser(SyncUserRequest request) {
        log.info("Bắt đầu xử lý đồng bộ User từ Auth-Service cho ID: [{}]", request.getId());

        // repository được kế thừa từ BaseService
        if (repository.existsById(request.getId())) {
            log.info("User ID [{}] đã tồn tại trong database, bỏ qua lưu mới.", request.getId());
            return mapper.toDto(repository.findById(request.getId()).get());
        }

        User user = User.builder()
                .id(request.getId())
                .fullname(request.getFullname())
                .email(request.getEmail())
                .age(request.getAge())
                .phone(request.getPhone())
                .totalSpent(BigDecimal.ZERO)
                .totalOrders(0)
                .membershipTier(MembershipTier.BRONZE)
                .build();

        User savedUser = repository.save(user);
        log.info("Đã đồng bộ và lưu thành công User mới vào id: [{}], Email : [{}]", savedUser.getId(), savedUser.getEmail());

        // mapper được kế thừa từ BaseService
        return mapper.toDto(savedUser);
    }

 //Cập nhật avt lên MinIO
    @Override
    public UserResponse uploadUserAvatar(Long id, MultipartFile file) {
        log.info("Bắt đầu xử lý tải ảnh đại diện lên cho User ID : {} ", id);

        User user = repository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null));

        String oldAvatarUrl = user.getAvatarUrl();
        String avatarUrl = minioService.uploadFile(file, "avatars");
        user.setAvatarUrl(avatarUrl);
        User updatedUser = repository.save(user);

        if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
            minioService.deleteFile(oldAvatarUrl);
        }
        log.info("Cập nhật ảnh đại diện thành công cho User ID : {}. URL : {}", id, avatarUrl);
        return mapper.toDto(updatedUser);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<UserResponse> updateMyProfile(UserResponse dto) {
        try {
            Long id = dto.getId();
            User user = repository.findById(id)
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null));

            // MapStruct tự động cập nhật các thay đổi vào Entity cũ mà không ghi đè null, đồng thời bỏ qua các trường nhạy cảm
            mapper.updateProfileFromDTO(dto, user);
            User updated = repository.save(user);

            BaseResponse<UserResponse> response = new BaseResponse<>();
            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(updated));
            response.setMessage(getSuccessMessage("update"));
            return response;
        } catch (Exception ex) {
            throw new RuntimeException("Cập nhật thông tin cá nhân thất bại", ex);
        }
    }
    @Override
    public void requestChangeEmailOtp(Long userId, String newEmail) {
        User user = repository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null));
        // Sinh mã ngẫu nhiên 6 số có đệm 0 nếu cần (ví dụ: 042918)
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        // Lưu vào Redis với thời gian hết hạn (TTL) là 60 giây
        String redisKey = "otp:email-change:" + userId;
        stringRedisTemplate.opsForValue().set(redisKey, newEmail + ":" + otpCode, Duration.ofSeconds(60));
        log.info("⭐ Đã lưu mã OTP [{}] cho UserID [{}] vào Redis, hết hạn sau 60s", otpCode, userId);
        // Bắn sự kiện lên Kafka để Noti gửi gmail
        EmailVerificationEvent event = EmailVerificationEvent.builder()
                .email(newEmail)
                .username(user.getFullname())
                .verificationToken(otpCode)
                .expiryTime(LocalDateTime.now().plusSeconds(60))
                .build();
        kafkaTemplate.send("send-otp-email-topic", String.valueOf(userId), event);
        log.info("🚀 [Kafka Producer] Đã bắn sự kiện gửi OTP tới Email [{}] lên topic [send-otp-email-topic]!", newEmail);
    }

    // Ktra mã OTP từ Redis và Cập nhật Email mới
    @Override
    public UserResponse verifyChangeEmailOtp(Long userId, String otpCode) {
        String redisKey = "otp:email-change:" + userId;
        String cachedData = stringRedisTemplate.opsForValue().get(redisKey);
        if(cachedData == null){
            throw new BusinessException(HttpStatus.BAD_REQUEST,"Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng lấy mã mới",null);
        }
        String[] parts = cachedData.split(":");
        String newEmail = parts[0];
        String savedOtp = parts[1];
        if(!savedOtp.equals(otpCode.trim())){
            throw new BusinessException(HttpStatus.BAD_REQUEST,"Mã xác thực OTP không chính xác!",null);
        }
        //Nếu mã đúng -> Cập nhật Email vào DB
        User user = repository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,"Không tìm thấy người dùng",null));
        user.setEmail(newEmail);
        User updatedUser = repository.save(user);

        // Đồng bộ sang Auth-Service để cập nhật trong auth_db
        try {
            authClient.updateEmailInternal(userId, newEmail);
            log.info("⭐ Đã đồng bộ Email mới [{}] sang Auth-Service thành công!", newEmail);
        } catch (Exception ex) {
            log.error("💥 Lỗi khi đồng bộ Email sang Auth-Service: {}", ex.getMessage());
        }

        //Xóa mã OTP trong Redis sau khi đã dùng xong
        stringRedisTemplate.delete(redisKey);
        log.info("Xác thực thành công ! Đã đổi email của user [{}] thành [{}]",userId,newEmail);
        return mapper.toDto(updatedUser);
    }
}