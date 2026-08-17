package com.example.client;

import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/users/internal/{id}")
    BaseResponse<Map<String,Object>> getUserDetails(@PathVariable("id") Long id);
}
