package com.example.payment_service.client;

import com.example.payment_service.config.FeignClientConfig;
import com.example.payment_service.dto.response.OrderDetailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign Client gọi sang order-service để lấy thông tin đơn hàng.
 * Được dùng trong PaymentServiceImpl.createVNPAYUrl() để lấy totalPrice.
 */
@FeignClient(name = "order-service", configuration = FeignClientConfig.class)
public interface OrderClient {

    @GetMapping("/api/orders/{orderId}")
    OrderDetailResponse getOrderById(@PathVariable("orderId") String orderId);
}
