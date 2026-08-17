package com.example.user_service.client;

import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service") // Chỉ định gọi sang auth-service
public interface AuthClient {

    // Gọi đến API xóa mềm/vô hiệu hóa tài khoản ở auth-service
    @DeleteMapping("/api/auth/internal/users/{id}")
    BaseResponse<Void> disableUser(@PathVariable("id") Long id);
}