package com.example.auth_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String jwt;
    private String refreshToken;
    private String username;
    private Long userId;
    private String message;
    private Boolean isNewUser;
    private String email;
    private String fullname;
}
