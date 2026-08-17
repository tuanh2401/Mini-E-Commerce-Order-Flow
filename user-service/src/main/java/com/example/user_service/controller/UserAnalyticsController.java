package com.example.user_service.controller;

import com.example.lib.i18n.MessageHelper;
import com.example.lib.model.response.BaseResponse;
import com.example.user_service.dto.response.TopSpenderResponse;
import com.example.user_service.dto.response.UserAnalyticsResponse;
import com.example.user_service.service.UserAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users/analytics")
@RequiredArgsConstructor
public class UserAnalyticsController {

    private final UserAnalyticsService userAnalyticsService;
    private final MessageHelper messageHelper;

    // 1. Lấy thông tin tổng hợp tình hình User (Chỉ Admin mới có quyền xem)
    @GetMapping("/summary")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<UserAnalyticsResponse>> getUserSummary() {
        log.info("Admin đang yêu cầu truy xuất thống kê tổng quan người dùng");
        UserAnalyticsResponse data = userAnalyticsService.getUserSummary();

        // Sử dụng BaseResponse.success theo chuẩn mới
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    // 2. Lấy danh sách Top khách hàng chi tiêu nhiều nhất (Chỉ Admin)
    @GetMapping("/top-spenders")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<List<TopSpenderResponse>>> getTopSpenders(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Admin đang yêu cầu xem top {} khách hàng chi tiêu nhiều nhất", limit);
        List<TopSpenderResponse> data = userAnalyticsService.getTopSpender(limit);

        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    // 3. API nội bộ cung cấp thông tin cho Dashboard Aggregator Service
    @GetMapping("/internal/summary")
    public ResponseEntity<BaseResponse<UserAnalyticsResponse>> getInternalUserSummary() {
        log.info("[FEIGN-CALL] Nhận yêu cầu truy xuất dữ liệu nội bộ thống kê User");
        UserAnalyticsResponse data = userAnalyticsService.getUserSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }
}