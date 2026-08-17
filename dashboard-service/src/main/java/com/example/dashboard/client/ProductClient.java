//package com.example.dashboard.client;
//
//import com.example.dashboard.dto.response.ProductAnalyticsResponse;
//import com.example.lib.model.response.BaseResponse;
//import org.springframework.cloud.openfeign.FeignClient;
//import org.springframework.web.bind.annotation.GetMapping;
//
//@FeignClient(name = "product-service", path = "/api/products/analytics")
//public interface ProductClient {
//
//    @GetMapping("/internal/summary")
//    BaseResponse<ProductAnalyticsResponse> getSummary();
//}