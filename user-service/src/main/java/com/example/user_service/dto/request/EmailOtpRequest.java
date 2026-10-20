package com.example.user_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EmailOtpRequest {
    @NotBlank(message = "Email mới không được để trống")
    @Email(message = "Email phải đúng định dạng")
    private String newEmail;
    private String otpCode;

}
