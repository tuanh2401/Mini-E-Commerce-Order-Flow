package com.example.auth_service.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * DTO chứa thông tin hồ sơ người dùng trả về từ nhà cung cấp bên thứ ba (Google, Facebook).
 * Được dùng như "hợp đồng" nội bộ giữa SocialTokenVerifier và SocialAuthService.
 */
@Data
@Builder
public class SocialProfile {
    private String socialId;
    private String email;
    private String fullname;
}
