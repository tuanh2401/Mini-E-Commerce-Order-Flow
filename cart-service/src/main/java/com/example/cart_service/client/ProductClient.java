package com.example.cart_service.client;

import com.example.cart_service.dto.response.ProductResponse;
import com.example.lib.model.response.BaseResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service")
public interface ProductClient {

    // Gọi API nội bộ của Product Service, đồng bộ kiểu trả về BaseResponse
    @GetMapping("/api/products/internal/{id}")
    BaseResponse<ProductResponse> getProductById(@PathVariable("id") Long id);
}