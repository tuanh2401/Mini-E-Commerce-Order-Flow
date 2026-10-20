package com.example.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FindAccountRequest {
    @NotBlank(message = "Vui lòng nhập Email hoặc Số điện thoại")
    private String identifier;
}