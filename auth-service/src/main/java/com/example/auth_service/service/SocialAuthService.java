package com.example.auth_service.service;

import com.example.auth_service.client.UserClient;
import com.example.auth_service.dto.request.SocialLoginRequest;
import com.example.auth_service.dto.request.SocialRegisterRequest;
import com.example.auth_service.dto.request.SyncUserRequest;
import com.example.auth_service.dto.response.AuthResponse;
import com.example.auth_service.dto.response.SocialProfile;
import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.RoleReposiory;
import com.example.auth_service.repository.UserRepository;
import com.example.lib.model.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SocialAuthService {

    private final SocialTokenVerifier socialTokenVerifier;
    private final UserRepository userRepository;
    private final RoleReposiory roleReposiory;
    private final JwtService jwtService;
    private final AuthService authService; // dùng createRefreshToken
    private final PasswordEncoder passwordEncoder;
    private final UserClient userClient;

    @Transactional
    public AuthResponse loginWithSocial(SocialLoginRequest request) {
        // Bước 1: Xác thực token với nhà cung cấp
        SocialProfile profile = socialTokenVerifier.verify(request.getProvider(), request.getToken());

        // Bước 2: Tìm user theo socialId
        Optional<User> userOpt = findBySocialId(request.getProvider(), profile.getSocialId());

        // Bước 3: Nếu không tìm được bằng socialId, thử liên kết qua email
        if (userOpt.isEmpty()) {
            userOpt = tryLinkByEmail(profile, request.getProvider());
        }

        // Bước 4: Vẫn không tìm thấy → user mới, yêu cầu bổ sung thông tin
        if (userOpt.isEmpty()) {
            log.info("Social login lần đầu cho provider: [{}] - Social ID: [{}]. Yêu cầu bổ sung thông tin.",
                    request.getProvider(), profile.getSocialId());
            return AuthResponse.builder()
                    .isNewUser(true)
                    .email(profile.getEmail())
                    .fullname(profile.getFullname())
                    .message("Tài khoản chưa tồn tại. Vui lòng hoàn thiện thông tin cá nhân.")
                    .build();
        }

        // Bước 5: Cấp phát Token
        return buildAuthResponse(userOpt.get(), "Đăng nhập mạng xã hội thành công!");
    }

    @Transactional
    public AuthResponse registerWithSocial(SocialRegisterRequest request) {
        // Bước 1: Xác thực lại token (tránh replay attack)
        SocialProfile profile = socialTokenVerifier.verify(request.getProvider(), request.getToken());

        // Bước 2a: Kiểm tra trùng username
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Tên đăng nhập đã tồn tại trong hệ thống!", null);
        }

        // Bước 2b: Kiểm tra trùng email
        if (userRepository.findByEmail(profile.getEmail()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "Email đã tồn tại trong hệ thống!", null);
        }

        // Bước 3: Tìm vai trò mặc định
        Role userRole = roleReposiory.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Lỗi hệ thống: Chưa khởi tạo ROLE_USER trong database", null));

        // Bước 4: Xây dựng User entity
        User.UserBuilder userBuilder = User.builder()
                .username(request.getUsername())
                .email(profile.getEmail())
                .fullname(request.getFullname())
                // Mã hóa mật khẩu thực tế do user nhập — dùng để đăng nhập thường sau này
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .age(request.getAge())
                // Tài khoản được kích hoạt ngay vì Google/Facebook đã xác thực danh tính
                .enabled(true)
                .roles(Collections.singleton(userRole));

        // Gán socialId vào đúng trường tương ứng
        if ("FACEBOOK".equalsIgnoreCase(request.getProvider())) {
            userBuilder.facebookId(profile.getSocialId());
        } else if ("GOOGLE".equalsIgnoreCase(request.getProvider())) {
            userBuilder.googleId(profile.getSocialId());
        }

        User newUser = userBuilder.build();
        userRepository.save(newUser);
        log.info("Đã lưu User mới từ mạng xã hội vào Auth DB với id: [{}]", newUser.getId());

        // Bước 5: Đồng bộ hồ sơ sang user-service (best-effort, không fail cứng)
        syncUserToUserService(newUser);

        // Bước 6: Cấp phát Token
        return buildAuthResponse(newUser, "Tạo tài khoản và đăng nhập mạng xã hội thành công!");
    }

    private Optional<User> findBySocialId(String provider, String socialId) {
        if ("FACEBOOK".equalsIgnoreCase(provider)) {
            return userRepository.findByFacebookId(socialId);
        } else if ("GOOGLE".equalsIgnoreCase(provider)) {
            return userRepository.findByGoogleId(socialId);
        }
        return Optional.empty();
    }

    private Optional<User> tryLinkByEmail(SocialProfile profile, String provider) {
        Optional<User> emailUserOpt = userRepository.findByEmail(profile.getEmail());
        if (emailUserOpt.isPresent()) {
            User existingUser = emailUserOpt.get();
            if ("FACEBOOK".equalsIgnoreCase(provider)) {
                existingUser.setFacebookId(profile.getSocialId());
            } else if ("GOOGLE".equalsIgnoreCase(provider)) {
                existingUser.setGoogleId(profile.getSocialId());
            }
            userRepository.save(existingUser);
            log.info("Đã liên kết Social ID [{}] vào tài khoản email [{}]",
                    profile.getSocialId(), profile.getEmail());
            return Optional.of(existingUser);
        }
        return Optional.empty();
    }
    private void syncUserToUserService(User user) {
        try {
            SyncUserRequest syncRequest = SyncUserRequest.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .age(user.getAge())
                    .phone(user.getPhone())
                    .build();
            log.info("Bắt đầu đồng bộ Social User ID [{}] sang User-Service", user.getId());
            userClient.syncUser(syncRequest);
            log.info("Đồng bộ Social User ID [{}] thành công.", user.getId());
        } catch (Exception e) {
            log.error("LỖI ĐỒNG BỘ: Không thể đồng bộ Social UserID [{}] sang User-Service: {}",
                    user.getId(), e.getMessage());
        }
    }

    private AuthResponse buildAuthResponse(User user, String message) {
        String roleStr = getPrimaryRoleName(user);
        String jwtToken = jwtService.generateToken(user.getUsername(), user.getId(), roleStr);
        String refreshToken = authService.createRefreshToken(user.getId(), user.getUsername());

        return AuthResponse.builder()
                .jwt(jwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .isNewUser(false)
                .message(message)
                .build();
    }

    private String getPrimaryRoleName(User user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) return "USER";
        String roleName = user.getRoles().iterator().next().getName();
        return roleName.startsWith("ROLE_") ? roleName.substring(5) : roleName;
    }
}
