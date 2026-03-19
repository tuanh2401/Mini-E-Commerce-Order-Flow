package com.example.auth_service.service;

import com.example.lib.util.JwtHelper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}") // time
    private Long expiration;

    private JwtHelper jwtHelper;

    @PostConstruct
    public void init() {
        this.jwtHelper = new JwtHelper(secret);
    }

    // Cỗ máy in thẻ - máy kiểm tra thẻ
    public String generateToken(String username, Long userId) {
        return jwtHelper.generateToken(username, userId, expiration);
    }

    /**
     * Lấy username từ payload của JWT (claim "sub").
     */
    public String getUsernameFromToken(String token) {
        return jwtHelper.extractUsername(token);
    }

    /**
     * Lấy userId từ payload (claim "userId" do mình thêm khi tạo token).
     */
    public Long getUserIdFromToken(String token) {
        return jwtHelper.extractUserId(token);
    }

    public boolean validateToken(String token) {
        return jwtHelper.validateToken(token);
    }
}
