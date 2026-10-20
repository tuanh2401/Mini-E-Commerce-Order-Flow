package com.example.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Vui lòng nhập tên tài khoản (Username)")
    private String username;
}

