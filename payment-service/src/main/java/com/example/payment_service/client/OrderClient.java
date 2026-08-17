package com.example.payment_service.client;

import com.example.lib.model.response.BaseResponse;
import com.example.payment_service.dto.response.OrderDetailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "order-service", url = "${config.order.url}")
public interface OrderClient {

    // Gọi API nội bộ của Order Service, đồng bộ kiểu trả về BaseResponse
    @GetMapping("/api/orders/internal/{orderId}")
    BaseResponse<OrderDetailResponse> getOrderById(@PathVariable("orderId") String orderId);
}