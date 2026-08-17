package com.example.controller;

import com.example.dto.response.PromotionAnalyticsResponse;
import com.example.lib.model.response.BaseResponse;
import com.example.service.PromotionAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/promotions/analytics")
@RequiredArgsConstructor
public class PromotionAnalyticsController {

    private final PromotionAnalyticsService promotionAnalyticsService;

    /**
     * Lấy tổng quan phân tích khuyến mãi (Admin).
     * URL: GET /api/promotions/analytics/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<PromotionAnalyticsResponse>> getPromotionSummary() {
        log.info("Admin đang yêu cầu xem thống kê tổng quan khuyến mãi");
        PromotionAnalyticsResponse data = promotionAnalyticsService.getPromotionSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * API NỘI BỘ (Dashboard Service gọi qua Feign) để lấy thống kê.
     * URL: GET /api/promotions/analytics/internal/summary
     */
    @GetMapping("/internal/summary")
    public ResponseEntity<BaseResponse<PromotionAnalyticsResponse>> getInternalSummary() {
        log.info("[FEIGN-CALL] Nhận yêu cầu nội bộ thống kê khuyến mãi");
        PromotionAnalyticsResponse data = promotionAnalyticsService.getPromotionSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }
}