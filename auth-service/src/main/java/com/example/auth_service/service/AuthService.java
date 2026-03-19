package com.example.auth_service.service;

import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.LoginRequest;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@Service
// Xử lý nghiệp vụ đăng nhập và đăng ký ( Trạm cấp thẻ )
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final com.example.auth_service.client.UserClient userClient;

    public AuthService(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder, com.example.auth_service.client.UserClient userClient) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userClient = userClient;
    }

    public AuthResponse authenticate(LoginRequest request) {
        // Tìm user theo username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Sai username hoặc password"));
        // Kiểm tra password(So sánh với password đã mã hóa trong db)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Sai username hoặc password");
        }
        // Tạo JWT
        String token = jwtService.generateToken(user.getUsername(), user.getId());
        try {
            com.example.auth_service.dto.SyncUserRequest syncRequest = com.example.auth_service.dto.SyncUserRequest.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .build();
            userClient.syncUser(syncRequest);
        } catch (Exception e) {
            System.err.println("Lỗi lazy sync User: " + e.getMessage());
        }

        // Trả về AuthReponse
        return AuthResponse.builder()
                .jwt(token)
                .username(user.getUsername())
                .userId(user.getId())
                .build();
    }

    public AuthResponse register(LoginRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getUsername() + "@example.com")
                .build();
        userRepository.save(user);
        try {
            com.example.auth_service.dto.SyncUserRequest syncRequest = com.example.auth_service.dto.SyncUserRequest.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .build();
            userClient.syncUser(syncRequest);
        } catch (Exception e) {
            System.err.println("Lỗi đồng bộ User: " + e.getMessage());
        }

        String token = jwtService.generateToken(user.getUsername(), user.getId());
        return AuthResponse.builder()
                .jwt(token)
                .username(user.getUsername())
                .userId(user.getId())
                .build();
    }
}
