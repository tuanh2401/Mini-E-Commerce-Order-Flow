package com.example.auth_service.service;
import com.example.auth_service.client.UserClient;
import com.example.auth_service.dto.request.*;
import com.example.auth_service.dto.response.AuthResponse;
import com.example.auth_service.entity.Permission;
import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.event.AuthEventPublisher;
import com.example.auth_service.repository.PermissionRepository;
import com.example.auth_service.repository.RoleReposiory;
import com.example.lib.model.dto.EmailVerificationEvent;
import com.example.auth_service.repository.UserRepository;
import com.example.lib.model.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import com.example.auth_service.exception.Message;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
// Xử lý nghiệp vụ đăng nhập và đăng ký ( Trạm cấp thẻ )
@RequiredArgsConstructor
public class    AuthService {
    private final UserRepository userRepository;
    private final RoleReposiory roleReposiory;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder; //kểm tra và mã hóa mk
    private final UserClient userClient;
    private final AuthEventPublisher authEventPublisher;
    private final StringRedisTemplate stringRedisTemplate;
    @Autowired
    private PermissionRepository permissionRepository;
    @Autowired
    private RoleReposiory roleReposiary;
    @Autowired
    private RolePermissionSyncService rolePermissionSyncService;
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    //Hàm phụ trợ lấy thông tin quyền để sinh token JWT
    private String getPrimaryRoleName(User user) {
        if(user.getRoles()==null || user.getRoles().isEmpty())
            return "USER";
        //Lấy tên role đầu tiên và bỏ "ROLE_" nếu có
        String roleName = user.getRoles().iterator().next().getName();
        return roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
    }
    //Hàm tạo refresh và lưu vào Redis
    public String createRefreshToken(Long userId, String username) {
        String refreshToken = UUID.randomUUID().toString();
        String redisKey = "refresh_token:" + refreshToken;
        String value = userId + ":" + username;
        stringRedisTemplate.opsForValue().set(redisKey, value, refreshExpirationMs, TimeUnit.MILLISECONDS);
        return refreshToken;
    }
    //Xử lý cấp accessToken mới từ refresh Token
    public AuthResponse refreshAccessToken(TokenRefreshRequest request) {
        String token = request.getRefreshToken();
        String redisKey = "refresh_token:" + token;
        String value = stringRedisTemplate.opsForValue().get(redisKey);

        if (value == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Refresh Token không hợp lệ hoặc đã hết hạn!", null);
        }

        String[] parts = value.split(":");
        Long userId = Long.parseLong(parts[0]);
        String username = parts[1];

        // Tìm user và lấy quyền
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại", null));
        String roleStr = getPrimaryRoleName(user);

        // Tạo Access Token mới
        String newAccessToken = jwtService.generateToken(username, userId, roleStr);

        // Tùy chọn: Xoay vòng (Rotation) Refresh Token để tăng độ bảo mật
        stringRedisTemplate.delete(redisKey);
        String newRefreshToken = createRefreshToken(userId, username);

        return AuthResponse.builder()
                .jwt(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(userId)
                .username(username)
                .message("Token refreshed successfully")
                .build();
    }

    public void logout(String refreshToken) {
        String redisKey = "refresh_token:" + refreshToken;
        stringRedisTemplate.delete(redisKey);
        log.info("Đã xóa refresh token khỏi Redis (Logout thành công)");
    }
    public AuthResponse authenticate(LoginRequest request) {
        // Tìm user theo username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Đăng nhập thất bại: Không tìm thấy username [{}]",request.getUsername());
                    return new BadCredentialsException(Message.ERROR_BAD_CREDENTIALS.getMessage());
                });
        //Kt tk đã xác thực email chưa
        if(!user.isEnabled()) {
            log.warn("Đăng nhập thất bại: Tài khoản [{}] chưa được kích hoạt",request.getUsername());
            throw new BusinessException(
                    HttpStatus.FORBIDDEN,
                    Message.ERROR_ACCOUNT_NOT_VERIFIED.getMessage(),
                    null
            );
        }
        // Kiểm tra password(So sánh với password đã mã hóa trong db)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Đăng nhập thất bại: Sai mật khẩu cho user [{}]",request.getUsername());
            throw new BadCredentialsException(Message.ERROR_BAD_CREDENTIALS.getMessage());
        }
        //Lấy vai trò và ds quyền từ dtb
       String roleStr = getPrimaryRoleName(user);
        //Tạo jwt chứa cả quyền hạn động
        String token = jwtService.generateToken(user.getUsername(),user.getId(),roleStr);

        //Log thành công
        log.info("User [{}] (ID : {}) đăng nhập thành công vào hệ thống",user.getUsername(),user.getId());

        // Trả về AuthReponse
        String refreshToken = createRefreshToken(user.getId(), user.getUsername());
        return AuthResponse.builder()
                .jwt(token)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .userId(user.getId())
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        log.info("Nhận yêu cầu đăng ký tài khoản mới cho username : [{}] , email : [{}]",request.getUsername(),request.getEmail());
        if (request.getAge() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Tuổi không được để trống !", null);
        }
        Optional<User> existingUserByUsername = userRepository.findByUsername(request.getUsername());
        if(existingUserByUsername.isPresent()) {
            User user = existingUserByUsername.get();
            if(user.isEnabled()){
                throw new BusinessException(HttpStatus.CONFLICT,Message.ERROR_USERNAME_EXISTS.getMessage(), null);
            }else {
                //TK chưa đc active
                userRepository.delete(user);
                userRepository.flush(); //update db để tránh lỗi unique constraint
            }
        }
        //kt trùng email
        Optional<User> existingUserByEmail = userRepository.findByEmail(request.getEmail());
        if(existingUserByEmail.isPresent()) {
            User user = existingUserByEmail.get();
            if(user.isEnabled()){
                throw new BusinessException(HttpStatus.CONFLICT,Message.ERROR_EMAIL_EXISTS.getMessage(), null);
            }else{
                userRepository.delete(user);
                userRepository.flush();
            }
        }
        //Tìm vai trò mặc định ROLE_USER từ Database
        Role defaultRole = roleReposiory.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi hệ thống: Chưa khởi tạo vai trò mặc định ROLE_USER trong CSDL",
                        null
                ));
        //Sinh chuỗi token ngẫu nhiên bảo mật tuyệt đối bằng UUID
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);
        //Tạo entity User và lưu vào database
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .roles(Collections.singleton(defaultRole))
                .fullname(request.getFullname())
                .age(request.getAge())
                .verificationToken(token)
                .expiryTime(expiryTime)
                .enabled(false)
                .build();
        userRepository.save(user);
        log.info("Đã lưu User mới vào Auth database với id: {}",user.getId());
        log.info("===> [TEST CHAY] Token kích hoạt của User [{}] là: {}", user.getUsername(), token);
        //Gửi event xác thực sang rabbitmq
        try{
            EmailVerificationEvent emailEvent = EmailVerificationEvent.builder()
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .verificationToken(token)
                    .expiryTime(expiryTime)
                    .build();
            log.info("Chuẩn bị đẩy EmailEvent của User [{}] lên hàng đợi...",user.getUsername());
            authEventPublisher.publishEmailVerificationEvent(emailEvent);
        }catch (Exception e){
            log.error("LỖI GỬI EVENT : Không thể đẩy email Event của user [{}] lên Broker: {}",user.getUsername(),e.getMessage());
        }

        log.info("Hoàn tất đăng ký bước 1 cho USER : [{}]. Đang chờ xác thực email.",user.getUsername());
        return AuthResponse.builder()
                .jwt(null)
                .username(user.getUsername())
                .userId(user.getId())
                .message("Vui lòng kiểm tra email để lấy mã xác thực")
                .build();
    }


    public AuthResponse verifyByToken(String token) {
       log.info("Bắt đầu quy trình kích hoạt tài khoản bằng token [{}]",token);
        //Tìm user theo verificationToken
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    log.warn("Xác thực thất bại: Không tìm thấy tài khoản nào khớp với token đã cung cấp");
                    return new BusinessException(HttpStatus.NOT_FOUND,"error.verification_token.not_found",null);
                });
        //Kt nếu tk actice r
        if(user.isEnabled()){
            log.warn("Xác thực thất bại: Tài khoản [{}] đã được kích hoạt từ trước",user.getUsername());
            throw new BusinessException(HttpStatus.BAD_REQUEST,"error.email.already_verified",null);
        }
        //kt tgian hết hạn của mã
        if(LocalDateTime.now().isAfter(user.getExpiryTime())){
            log.warn("Xác thực thất bại: Token của [{}] đã hết hạn lúc {}",user.getUsername(),user.getExpiryTime());
            throw new BusinessException(HttpStatus.GONE,Message.ERROR_VERIFICATION_TOKEN_EXPIRED.getMessage(),null);
        }
        //Nếu mọi thứ ok => kích hoạt tài khoản
        user.setEnabled(true);
        //Xóa mã và thời gian hết hạn sau khi dùng xong
        user.setVerificationToken(null);
        user.setExpiryTime(null);
        userRepository.save(user);
        log.info("Tài khoản [{}] đã được kích hoạt thành công!",user.getUsername());
        try {
            SyncUserRequest syncRequest = SyncUserRequest.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullname(user.getFullname())
                    .age(user.getAge())
                    .email(user.getEmail())
                    .build();
            log.info("Bắt đầu đồng bộ thông tin UserID [{}] sang User-Service",user.getId());
            userClient.syncUser(syncRequest);
            log.info("Đồng bộ User ID [{}] thành công.",user.getId());
        } catch (Exception e) {
            log.error("LỖI ĐỒNG BỘ : Không thể đồng bộ UserID [{}] sang User-Service , chi tiết: {}",user.getId(), e.getMessage());
        }
        //Lấy vai trò và ds quyền từ dtb
        String roleStr = getPrimaryRoleName(user);
        //Tạo jwt chứa cả quyền hạn động
        String jwttoken = jwtService.generateToken(user.getUsername(),user.getId(),roleStr);


        String refreshToken = createRefreshToken(user.getId(), user.getUsername());
        return AuthResponse.builder()
                .jwt(jwttoken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .userId(user.getId())
                .message("Xác thực thành công! Chào mừng bạn đến với hệ thống.")
                .build();
    }
    public void rejectRegistration(String token) {
        log.info("Bắt đầu xử lý hủy yêu cầu đăng ký với token : [{}]",token);
        //1. Tìm user theo verificationToken trong dtb
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    log.warn("Hủy đăng ký thất bại , không tìm thấy tài khoản có token ứng với thông tin đã cung cấp");
                    return new BusinessException(HttpStatus.NOT_FOUND,Message.ERROR_VERIFICATION_TOKEN_NOT_FOUND.getMessage(), null);
                });
        //2.Nếu tìm thấy và tài khoản đã active -> 0 xly
        if(user.isEnabled()){
            log.warn("Hủy đăng ký thất bại : Tài khoản [{}] đã được kích hoạt",user.getUsername());
            throw new BusinessException(HttpStatus.BAD_REQUEST,Message.ERROR_EMAIL_ALREADY_VERIFIED.getMessage(), null);
        }
        //3.Nếu tìm thấy và tài khoản chưa kích hoạt (enable = false) -> xóa user
        String username = user.getUsername();
        String email = user.getEmail();
        userRepository.delete(user);
        userRepository.flush();
        log.info("Hủy đăng ký thành công . Đã xóa tk tạm thời của User [{}] (Email : [{}]), giải phóng tài nguyên hệ thống",username,email);
    }
    @Transactional
    public void disableAndBlackListUser(Long userId) {
        //Tìm và vô hiệu hóa/xóa mềm tài khoản trong auth_db
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,"Không tìm thấy user", null));
        user.setDeletedAt(LocalDateTime.now());//cập nhật delete_At
        //Đổi tên username và Email để giải phóng ràng buộc unique
        long timeStamp = System.currentTimeMillis() / 1000;
        user.setUsername(user.getUsername() + "_deleted_" + timeStamp);
        user.setEmail(user.getEmail() + "_deleted_" + timeStamp);
        if (user.getGoogleId() != null) {
            user.setGoogleId(user.getGoogleId() + "_deleted_" + timeStamp);
        }
        if (user.getFacebookId() != null) {
            user.setFacebookId(user.getFacebookId() + "_deleted_" + timeStamp);
        }
        userRepository.save(user);
        //Đưa userId vào blacklist trên redis để vô hiệu hóa token ngay lập tức
        String redisKey = "blacklist:user:" + userId;
        stringRedisTemplate.opsForValue().set(redisKey,"true",24, TimeUnit.HOURS);
        log.info("Đã vô hiệu hóa tài khoản và đưa userID [{}] vào BlackList.",userId);
    }
    @Transactional
    public Permission createPermission(PermissionRequest request) {
        if(permissionRepository.findByName(request.getName()).isPresent()){
            throw new BusinessException(HttpStatus.BAD_REQUEST,"Quyền này đã tồn tại",null);
        }
        Permission permission = Permission.builder()
                .name(request.getName().toUpperCase())
                .description(request.getDescription())
                .build();
        return permissionRepository.save(permission);
    }
    @Transactional
    public Role createRole(RoleRequest request) {
        if(roleReposiory.findByName(request.getName()).isPresent()){
            throw new BusinessException(HttpStatus.BAD_REQUEST,"Vai trò này đã tồn tại",null);
        }
        //Tìm danh sách các entity Permission dựa vào ListID gửi lên
        List<Permission> permissions = permissionRepository.findAllById(request.getPermissionIds());
        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .description(request.getDescription())
                .permissions(new HashSet<>(permissions))
                .build();
        Role savedRole = roleReposiory.save(role);
        rolePermissionSyncService.syncAllRolePermissions();
        return savedRole;
    }
    public AuthResponse registerAdmin(RegisterRequest registerRequest) {
        log.info("Yêu cầu tạo nhanh tài khoản admin để test: {}, email: {}", registerRequest.getUsername(), registerRequest.getEmail());
        //Kt trùng username
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Username đã tồn tại trong hệ thống !", null);
        }
        //KT trùng email
        if(userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw  new BusinessException(HttpStatus.CONFLICT, "Email đã tồn tại trong hệ thống!", null);
        }
        //Tìm vai trò role admin từ dtb
        Role adminRole = roleReposiory.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi hệ thống: Chưa khởi tạo vai trò ROLE_ADMIN trong database.",
                        null
                ));
        //Tạo đối tượng admin , k verify email
        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .email(registerRequest.getEmail())
                .roles(Collections.singleton(adminRole))
                .fullname(registerRequest.getFullname())
                .age(registerRequest.getAge())
                .enabled(true)
                .build();
        userRepository.save(user);
        //Đồng bộ sang user-service
        try{
            SyncUserRequest syncRequest = SyncUserRequest.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullname(user.getFullname())
                    .age(user.getAge())
                    .email(user.getEmail())
                    .build();
            userClient.syncUser(syncRequest);
            log.info("Đồng bộ Admin ID [{}] sang User-Service thành công.", user.getId());
        }catch (Exception e){
            log.error("LỖI ĐỒNG BỘ : Không thể đồng bộ AdminID [{}] sang User-Service: {}",user.getId(),e.getMessage());
        }
        //JWT
        String roleStr = getPrimaryRoleName(user);
        String jwttoken = jwtService.generateToken(user.getUsername(),user.getId(),roleStr);
        String refreshToken = createRefreshToken(user.getId(), user.getUsername());
        return AuthResponse.builder()
                .jwt(jwttoken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .userId(user.getId())
                .message("Tạo admin thành công ! Cấp token test")
                .build();
    }
    public AuthResponse registerStaff(RegisterRequest registerRequest){
        log.info("Admin yêu cầu tạo tài khoản nhân viên : {}, email: {}",registerRequest.getUsername(),registerRequest.getEmail());
        //Kiểm tra trùng username
        if(userRepository.findByUsername(registerRequest.getUsername()).isPresent()){
            throw new BusinessException(HttpStatus.CONFLICT,"Username này đã tồn tại trong hệ thống!",null);
        }
        //Kiểm tra trùng email
        if(userRepository.findByEmail(registerRequest.getEmail()).isPresent()){
            throw new BusinessException(HttpStatus.CONFLICT,"Email đã tồn tại trong hệ thống!",null);
        }
        //Lấy role ROLE_STAFF từ DB
        Role staffRole = roleReposiory.findByName("ROLE_STAFF")
                .orElseThrow(() -> new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR,"Lỗi hệ thống: Chưa khởi tạo vai trò ROLE_STAFF trong database.",null));
        User user = User.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .email(registerRequest.getEmail())
                .roles(Collections.singleton(staffRole))
                .fullname(registerRequest.getFullname())
                .age(registerRequest.getAge())
                .enabled(true)
                .build();
        userRepository.save(user);

        // Đồng bộ sang user-service qua userClient (giống registerAdmin)
        try {
            SyncUserRequest syncRequest = SyncUserRequest.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullname(user.getFullname())
                    .age(user.getAge())
                    .email(user.getEmail())
                    .build();
            userClient.syncUser(syncRequest);
            log.info("Đồng bộ Staff ID [{}] sang User-Service thành công.", user.getId());
        } catch (Exception e) {
            log.error("LỖI ĐỒNG BỘ: Không thể đồng bộ Staff ID [{}] sang User-Service: {}", user.getId(), e.getMessage());
        }

        return AuthResponse.builder()
                .username(user.getUsername())
                .userId(user.getId())
                .message("Tạo tài khoản nhân viên thành công!")
                .build();
    }
    // Hàm ẩn bớt ký tự email (vd: nguyentuananh240104@gmail.com -> n***4@gmail.com)
    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + domain;
    }

    // Hàm ẩn bớt số điện thoại (vd: 0967233789 -> 096****789)
    public String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return phone;
        int len = phone.length();
        return phone.substring(0, 3) + "****" + phone.substring(len - 3);
    }

    // 1. Yêu cầu quên mật khẩu theo Tên tài khoản (Username)
    public com.example.auth_service.dto.response.ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String username = request.getUsername().trim();
        log.info("Nhận yêu cầu quên mật khẩu cho Username: [{}]", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với tên đăng nhập: " + username, null));

        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Tài khoản này chưa liên kết với Email để nhận mã OTP!", null);
        }

        // Sinh mã OTP 6 số ngẫu nhiên
        String otpCode = String.format("%06d", new Random().nextInt(1000000));

        // Lưu vào Redis theo key username (TTL = 3 phút)
        String redisKey = "otp:forgot-password:" + username;
        stringRedisTemplate.opsForValue().set(redisKey, otpCode, Duration.ofMinutes(3));
        log.info("⭐ Đã lưu OTP [{}] cho tài khoản [{}] vào Redis (hết hạn sau 3p)", otpCode, username);

        // Bắn sự kiện lên Kafka gửi tới Email của user
        EmailVerificationEvent event = EmailVerificationEvent.builder()
                .email(user.getEmail())
                .username(user.getFullname() != null ? user.getFullname() : user.getUsername())
                .verificationToken(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(3))
                .build();

        kafkaTemplate.send("send-otp-email-topic", String.valueOf(user.getId()), event);
        log.info("🚀 [KAFKA] Đã bắn sự kiện gửi OTP quên mật khẩu tới hòm thư [{}] lên topic [send-otp-email-topic]!", user.getEmail());

        String maskedEmail = maskEmail(user.getEmail());
        return com.example.auth_service.dto.response.ForgotPasswordResponse.builder()
                .username(username)
                .maskedEmail(maskedEmail)
                .message("Mã OTP 6 số đã được gửi đến email liên kết: " + maskedEmail)
                .build();
    }

    // 2. Xác thực OTP và đặt lại mật khẩu mới
    @Transactional(rollbackFor = Exception.class)
    public void resetPassword(ResetPasswordRequest request) {
        String username = request.getUsername().trim();
        String otpCode = request.getOtpCode().trim();
        log.info("Nhận yêu cầu đặt lại mật khẩu cho tài khoản: [{}]", username);

        // 1. Lấy mã OTP từ Redis
        String redisKey = "otp:forgot-password:" + username;
        String savedOtp = stringRedisTemplate.opsForValue().get(redisKey);

        if (savedOtp == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại yêu cầu!", null);
        }

        // 2. So khớp mã OTP
        if (!savedOtp.equals(otpCode)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Mã xác thực OTP không chính xác!", null);
        }

        // 3. Tìm User và mã hóa mật khẩu mới bằng BCrypt
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản: " + username, null));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Xóa OTP trong Redis
        stringRedisTemplate.delete(redisKey);
        log.info("✅ Đặt lại mật khẩu thành công cho tài khoản: [{}]", user.getUsername());
    }

    // 3. Tìm tài khoản khi Quên Tên Đăng Nhập (theo Email hoặc Số điện thoại)
    public com.example.auth_service.dto.response.FindAccountResponse findAccount(FindAccountRequest request) {
        String identifier = request.getIdentifier().trim();
        log.info("Nhận yêu cầu tìm tài khoản theo thông tin: [{}]", identifier);

        List<User> users = userRepository.findByEmailOrPhone(identifier, identifier);
        if (users == null || users.isEmpty()) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản nào khớp với Email hoặc Số điện thoại: " + identifier, null);
        }

        User user = users.get(0);

        // Gửi thông tin Tên đăng nhập về Email qua Kafka để tăng tính bảo mật
        try {
            EmailVerificationEvent event = EmailVerificationEvent.builder()
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .verificationToken(user.getFullname())
                    .expiryTime(LocalDateTime.now().plusHours(24))
                    .build();
            kafkaTemplate.send("send-find-account-email-topic", event);
            log.info("⭐ Đã bắn sự kiện gửi thông tin tài khoản qua Kafka tới email [{}]", user.getEmail());
        } catch (Exception ex) {
            log.error("💥 Không thể gửi thông tin tài khoản qua Kafka: {}", ex.getMessage());
        }

        return com.example.auth_service.dto.response.FindAccountResponse.builder()
                .username(null) // Ẩn username trên giao diện để bảo mật tối đa
                .fullname(user.getFullname())
                .maskedEmail(maskEmail(user.getEmail()))
                .maskedPhone(maskPhone(user.getPhone()))
                .build();
    }

    // 4. Đồng bộ Email từ User-Service sang Auth-Service
    @Transactional(rollbackFor = Exception.class)
    public void updateEmailInternal(Long userId, String email) {
        log.info("[ĐỒNG BỘ NỘI BỘ] Cập nhật Email cho User ID [{}] thành [{}]", userId, email);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng", null));
        user.setEmail(email.trim());
        userRepository.save(user);
        log.info("[ĐỒNG BỘ NỘI BỘ] Đã cập nhật thành công Email mới vào auth_db cho User ID [{}]", userId);
    }
}
