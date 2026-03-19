package com.example.user_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UpdateUserRequest {
    @NotBlank(message = "Tên không được để trống")
    private String fullName;
    private String email;
    private String phone;

    private String address;

}
