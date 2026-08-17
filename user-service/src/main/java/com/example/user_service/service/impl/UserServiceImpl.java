package com.example.user_service.service.impl;

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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Slf4j
@Service
public class UserServiceImpl extends BaseService<UserRepository, UserResponse, User, UserMapper, Long> implements UserService {

    private final MinioService minioService;

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
}