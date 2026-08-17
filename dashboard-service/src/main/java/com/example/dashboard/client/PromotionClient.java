package com.example.dashboard.client;

import com.example.dashboard.dto.response.PromotionAnalyticsResponse;
import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "promotion-service", path = "/api/promotions/analytics")
public interface PromotionClient {

    @GetMapping("/internal/summary")
    BaseResponse<PromotionAnalyticsResponse> getSummary();
}