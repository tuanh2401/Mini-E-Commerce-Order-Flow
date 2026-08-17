package com.example.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialLoginRequest {
    @NotBlank(message = "Provider không được để trống")
    private String provider;
    @NotBlank(message = "Token không được để trống")
    private String token; //IdToken từ Google hoặc accessToken từ fb
}
