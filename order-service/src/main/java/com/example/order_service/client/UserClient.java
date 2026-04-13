package com.example.order_service.client;

import com.example.order_service.dto.response.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/internal/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);
}
