package com.example.order_service.client;

import com.example.lib.dto.ApiResponse;
import com.example.order_service.config.FeignClientConfig;
import com.example.order_service.dto.response.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/api/products/internal/{id}")
    ApiResponse<ProductResponse> getProductById(@PathVariable("id") Long id);

    @PutMapping("/api/products/internal/{id}/reduce-stock")
    ApiResponse<Void> reduceStock(@PathVariable("id") Long id, @RequestParam("quantity") Integer quantity);
}


