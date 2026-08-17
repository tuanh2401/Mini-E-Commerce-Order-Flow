package com.example.order_service.service;

import com.example.order_service.dto.response.OrderAnalyticsResponse;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.dto.response.RevenueDataPoint;
import com.example.order_service.dto.response.TopProductResponse;

import java.time.LocalDate;
import java.util.List;

public interface OrderAnalyticsService {
    //Lấy thông tin tổng quan của toàn bộ đơn hàng
    OrderAnalyticsResponse getOrderSummary();
    //Thống kê doanh thu theo thời gian và group
    List<RevenueDataPoint> getRevenueOverTime(LocalDate startDate, LocalDate endDate , String groupBy);
    //Lấy danh sách sản phẩm bán chạy nhất kèm theo số lượng và doanh thu tương ứng
    List<TopProductResponse> getTopSellingProducts(int limit);
    //Lấy ds đơn hàng gần đây nhất
    List<OrderResponse> getRecentOrders(int limit);
}
