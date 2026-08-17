package com.example.dashboard.client;

import com.example.dashboard.dto.response.OrderAnalyticsResponse;
import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "order-service", path = "/api/orders/analytics")
public interface OrderClient {

    @GetMapping("/internal/summary")
    BaseResponse<OrderAnalyticsResponse> getSummary();
}