package com.example.order_service.client;

import com.example.lib.model.response.BaseResponse;
import com.example.order_service.dto.request.ValidateVoucherRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

@FeignClient(name = "promotion-service")
public interface PromotionClient {

    @PostMapping("/api/promotions/internal/validate-and-calculate")
    BaseResponse<BigDecimal> validateAndCalculate(@RequestBody ValidateVoucherRequest request);

    @PutMapping("/api/promotions/internal/apply")
    BaseResponse<Void> apply(@RequestParam("code") String code);
}