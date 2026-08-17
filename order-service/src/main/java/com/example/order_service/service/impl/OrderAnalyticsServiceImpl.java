package com.example.order_service.service.impl;

import com.example.order_service.dto.response.OrderAnalyticsResponse;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.dto.response.RevenueDataPoint;
import com.example.order_service.dto.response.TopProductResponse;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.mapper.OrderMapper;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderAnalyticsServiceImpl implements OrderAnalyticsService {

    private final OrderRepository orderRepository;

    // Tiêm OrderMapper để sử dụng chuyển đổi tự động
    private final OrderMapper orderMapper;

    @Override
    public OrderAnalyticsResponse getOrderSummary() {
        List<Order> orders = orderRepository.findAll();
        long totalOrders = orders.size();

        // Tổng doanh thu: lọc ra các đơn đã thanh toán và cộng dồn
        BigDecimal totalRevenue = orders.stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.getStatus()))
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính giá trị trung bình mỗi đơn hàng
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (totalOrders > 0) {
            avgOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }

        // Thống kê số lượng đơn hàng theo từng trạng thái
        Map<String, Long> ordersByStatus = orders.stream()
                .collect(Collectors.groupingBy(Order::getStatus, Collectors.counting()));

        return OrderAnalyticsResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .avgOrderValue(avgOrderValue)
                .ordersByStatus(ordersByStatus)
                .build();
    }

    @Override
    public List<RevenueDataPoint> getRevenueOverTime(LocalDate startDate, LocalDate endDate, String groupBy) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        // Gọi hàm truy vấn mới theo CreatedDate
        List<Order> orders = orderRepository.findByStatusAndCreatedDateBetween("PAID", startDateTime, endDateTime);

        // Gom nhóm các đơn hàng theo chu kỳ thời gian thông qua hàm getGroupKey
        Map<String, List<Order>> groupedOrders = orders.stream()
                .collect(Collectors.groupingBy(order -> getGroupKey(order.getCreatedDate(), groupBy)));

        // Map các nhóm đã gom thành các RevenueDataPoint và sắp xếp theo thứ tự thời gian
        return groupedOrders.entrySet().stream()
                .map(entry -> {
                    String period = entry.getKey();
                    List<Order> periodOrders = entry.getValue();

                    BigDecimal revenue = periodOrders.stream()
                            .map(Order::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long orderCount = periodOrders.size();
                    return RevenueDataPoint.builder()
                            .period(period)
                            .revenue(revenue)
                            .orderCount(orderCount)
                            .build();
                })
                .sorted((dp1, dp2) -> dp1.getPeriod().compareTo(dp2.getPeriod()))
                .collect(Collectors.toList());
    }

    @Override
    public List<TopProductResponse> getTopSellingProducts(int limit) {
        List<Order> paidOrders = orderRepository.findAll().stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.getStatus()))
                .collect(Collectors.toList());

        Map<Long, List<OrderItem>> itemsByProduct = paidOrders.stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.groupingBy(OrderItem::getProductId));

        return itemsByProduct.entrySet().stream()
                .map(entry -> {
                    Long productId = entry.getKey();
                    List<OrderItem> items = entry.getValue();
                    long totalQuantity = items.stream().mapToLong(OrderItem::getQuantity).sum();

                    BigDecimal revenue = items.stream()
                            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return TopProductResponse.builder()
                            .productId(productId)
                            .totalQuantitySold(totalQuantity)
                            .totalRevenue(revenue)
                            .build();
                })
                .sorted((p1, p2) -> Long.compare(p2.getTotalQuantitySold(), p1.getTotalQuantitySold()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getRecentOrders(int limit) {
        List<Order> orders;

        // Cập nhật phương thức truy vấn và so sánh theo CreatedDate
        if (limit == 10) {
            orders = orderRepository.findTop10ByOrderByCreatedDateDesc();
        } else {
            orders = orderRepository.findAll().stream()
                    .sorted((o1, o2) -> o2.getCreatedDate().compareTo(o1.getCreatedDate()))
                    .limit(limit)
                    .collect(Collectors.toList());
        }

        // Ánh xạ sang DTO Response thông qua OrderMapper tự động
        return orders.stream()
                .map(orderMapper::toDto)
                .collect(Collectors.toList());
    }

    // Hàm chuyển đổi LocalDateTime sang nhãn để gom nhóm thống kê theo chu kỳ
    private String getGroupKey(LocalDateTime date, String groupBy) {
        if (groupBy == null) {
            groupBy = "day";
        }
        switch (groupBy.toLowerCase()) {
            case "week":
                WeekFields weekFields = WeekFields.of(Locale.getDefault());
                int week = date.get(weekFields.weekOfWeekBasedYear());
                return date.getYear() + "-W" + String.format("%02d", week);
            case "month":
                return date.getYear() + "-M" + String.format("%02d", date.getMonthValue());
            case "quarter":
                int quarter = (date.getMonthValue() - 1) / 3 + 1;
                return date.getYear() + "-Q" + quarter;
            case "day":
            default:
                return date.toLocalDate().toString();
        }
    }
}