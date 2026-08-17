package com.example.order_service.controller;

import com.example.lib.model.response.BaseResponse;
import com.example.order_service.dto.response.OrderAnalyticsResponse;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.dto.response.RevenueDataPoint;
import com.example.order_service.dto.response.TopProductResponse;
import com.example.order_service.service.OrderAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/orders/analytics")
@RequiredArgsConstructor
public class OrderAnalyticsController {

    private final OrderAnalyticsService orderAnalyticsService;

    /**
     * Lấy thông tin tổng quan các đơn hàng (Doanh thu, số lượng đơn, ...) (Admin).
     * URL: GET /api/orders/analytics/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<OrderAnalyticsResponse>> getOrderSummary() {
        log.info("Yêu cầu xem tổng quan phân tích đơn hàng");
        OrderAnalyticsResponse summary = orderAnalyticsService.getOrderSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, summary));
    }

    /**
     * Lấy doanh thu theo chu kỳ thời gian (ngày, tuần, tháng, quý) (Admin).
     * URL: GET /api/orders/analytics/revenue-over-time
     */
    @GetMapping("/revenue-over-time")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<List<RevenueDataPoint>>> getRevenueOverTime(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(defaultValue = "day") String groupBy) {
        log.info("Yêu cầu xem doanh thu từ {} đến {} gom theo nhóm {}", startDate, endDate, groupBy);
        List<RevenueDataPoint> data = orderAnalyticsService.getRevenueOverTime(startDate, endDate, groupBy);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Lấy danh sách các sản phẩm bán chạy nhất (Admin).
     * URL: GET /api/orders/analytics/top-products
     */
    @GetMapping("/top-products")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<List<TopProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Yêu cầu xem danh sách sản phẩm bán chạy nhất, giới hạn: {}", limit);
        List<TopProductResponse> data = orderAnalyticsService.getTopSellingProducts(limit);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Lấy danh sách các đơn hàng gần đây nhất (Admin).
     * URL: GET /api/orders/analytics/recent
     */
    @GetMapping("/recent")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<List<OrderResponse>>> getRecentOrders(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Yêu cầu xem danh sách đơn hàng gần đây, giới hạn: {}", limit);
        List<OrderResponse> data = orderAnalyticsService.getRecentOrders(limit);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * API NỘI BỘ (Dashboard Service gọi qua Feign) để lấy thống kê.
     * URL: GET /api/orders/analytics/internal/summary
     */
    @GetMapping("/internal/summary")
    public ResponseEntity<BaseResponse<OrderAnalyticsResponse>> getInternalOrderSummary() {
        log.info("[NỘI BỘ] Dasboard-Service đang yêu cầu lấy thống kê đơn hàng");
        OrderAnalyticsResponse summary = orderAnalyticsService.getOrderSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, summary));
    }
}