package com.example.auth_service.client;

import com.example.auth_service.dto.SyncUserRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "user-service")
public interface UserClient {
    
    @PostMapping("/api/users/sync")
    void syncUser(@RequestBody SyncUserRequest request);
}
