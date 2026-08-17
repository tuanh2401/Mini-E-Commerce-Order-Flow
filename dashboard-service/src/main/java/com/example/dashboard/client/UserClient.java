package com.example.dashboard.client;

import com.example.dashboard.dto.response.UserAnalyticsResponse;
import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "user-service", path = "/api/users/analytics")
public interface UserClient {

    @GetMapping("/internal/summary")
    BaseResponse<UserAnalyticsResponse> getSummary();
}