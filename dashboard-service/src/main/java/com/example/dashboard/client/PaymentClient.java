package com.example.dashboard.client;

import com.example.dashboard.dto.response.PaymentAnalyticsResponse;
import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "payment-service", path = "/api/payments/analytics")
public interface PaymentClient {

    @GetMapping("/internal/summary")
    BaseResponse<PaymentAnalyticsResponse> getSummary();
}