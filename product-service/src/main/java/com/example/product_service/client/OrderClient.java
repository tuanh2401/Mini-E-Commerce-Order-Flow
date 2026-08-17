package com.example.product_service.client;

import com.example.lib.model.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "order-service")
public interface OrderClient {
    @GetMapping("/api/orders/internal/has-purchased")
    ApiResponse<Boolean> hasPurchasedProduct(@RequestParam("userId") Long userId, @RequestParam("productId") Long productId);
}
