package com.example.order_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderAnalyticsResponse {
    private long totalOrders;
    private BigDecimal totalRevenue; //tổng doanh thu
    private BigDecimal avgOrderValue; //gtri tb mỗi đơn hàng
    private Map<String, Long> ordersByStatus; //bản đồ lưu số lượng đơn hàng theo trạng thái
}
