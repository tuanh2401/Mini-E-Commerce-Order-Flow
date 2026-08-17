package com.example.payment_service.controller;

import com.example.lib.model.response.BaseResponse;
import com.example.payment_service.dto.response.PaymentAnalyticsResponse;
import com.example.payment_service.service.PaymentAnalyticsService;
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
@RequestMapping("/api/payments/analytics")
@RequiredArgsConstructor
public class PaymentAnalyticsController {

    private final PaymentAnalyticsService paymentAnalyticsService;

    /**
     * Lấy tổng quan phân tích doanh thu thanh toán (Admin).
     * URL: GET /api/payments/analytics/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<PaymentAnalyticsResponse>> getPaymentSummary() {
        log.info("Admin đang yêu cầu xem thống kê tổng quan thanh toán");
        PaymentAnalyticsResponse data = paymentAnalyticsService.getPaymentSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * API NỘI BỘ (Dashboard Service gọi qua Feign) để lấy thống kê.
     * URL: GET /api/payments/analytics/internal/summary
     */
    @GetMapping("/internal/summary")
    public ResponseEntity<BaseResponse<PaymentAnalyticsResponse>> getInternalSummary() {
        log.info("[FEIGN-CALL] Nhận yêu cầu nội bộ thống kê thanh toán");
        PaymentAnalyticsResponse data = paymentAnalyticsService.getPaymentSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }
}