package com.example.auth_service.client;

import com.example.auth_service.dto.SyncUserRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service") // Tên service đã đăng ký trên Consul
public interface UserClient {
    
    @PostMapping("/api/users/sync")
    void syncUser(@RequestBody SyncUserRequest request);
}
