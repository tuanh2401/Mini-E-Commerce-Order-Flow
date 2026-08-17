package com.example.auth_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username không được để trống")
    private String username;
    @NotBlank(message = "Mật khẩu không được để trống")
    @Pattern( regexp = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+=!_]).{8,}$",
            message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@#$%^&+=!)")
    private String password;
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;
    @NotBlank(message = "Tên không được để trống")
    private String fullname;
    private Integer age;

}
