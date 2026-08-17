package com.example.product_service.controller;

import com.example.lib.i18n.MessageHelper;
import com.example.lib.model.dto.ApiResponse;
import com.example.product_service.dto.response.CategoryDistributionResponse;
import com.example.product_service.dto.response.ProductAnalyticsResponse;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.exception.Message;
import com.example.product_service.service.ProductAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products/analytics")
@RequiredArgsConstructor
public class ProductAnalyticsController {
    private final ProductAnalyticsService productAnalyticsService;
    private final MessageHelper messageHelper;
    @GetMapping("/summary")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ApiResponse<ProductAnalyticsResponse> getProductSummary(){
        ProductAnalyticsResponse summary = productAnalyticsService.getProductSummary();
        return ApiResponse.success(Message.SUCCESS_VIEW_ANALYTICS.getMessage(),  summary);
    }
    @GetMapping("/low-stock")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ApiResponse<List<ProductResponse>> getLowStockProducts(@RequestParam(defaultValue = "10") int threshold){
        List<ProductResponse> products = productAnalyticsService.getLowStockProducts(threshold);
        return ApiResponse.success(Message.SUCCESS_VIEW_ANALYTICS.getMessage(), products);
    }
    @GetMapping("/top-rated")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ApiResponse<List<ProductResponse>> getTopRatedProducts(@RequestParam(defaultValue = "10") int limit){
        List<ProductResponse> products = productAnalyticsService.getTopRatedProducts(limit);
        return ApiResponse.success(Message.SUCCESS_VIEW_ANALYTICS.getMessage(), products);
    }
    @GetMapping("/category-distribution")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_REVIEW')")
    public ApiResponse<List<CategoryDistributionResponse>> getCategoryDistribution(){
        List<CategoryDistributionResponse> distribution = productAnalyticsService.getCategoryDistribution();
        return ApiResponse.success(Message.SUCCESS_VIEW_ANALYTICS.getMessage(), distribution);
    }
    //nội bộ từ dashboard-service qua feign-client
    @GetMapping("/internal/summary")
    public ApiResponse<ProductAnalyticsResponse> getProductSummaryInternal(){
        ProductAnalyticsResponse summary = productAnalyticsService.getProductSummary();
        return ApiResponse.success(Message.SUCCESS_VIEW_ANALYTICS.getMessage(), summary);
    }
}
