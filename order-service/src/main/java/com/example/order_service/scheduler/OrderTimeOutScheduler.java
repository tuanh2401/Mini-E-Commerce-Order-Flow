package com.example.order_service.scheduler;

import com.example.lib.model.dto.OrderCancelledEvent;
import com.example.lib.model.dto.OrderItemEvent;
import com.example.order_service.entity.Order;
import com.example.order_service.event.OrderEventPublisher;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderTimeOutScheduler {

    private final OrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;

    // Đọc số phút timeout từ file config, mặc định là 15 phút
    @Value("${order.payment-timeout-minutes:15}")
    private int timeoutMinutes;

    // Quét mỗi phút một lần (cron = "0 * * * * ?")
    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void cancelExpiredOrders() {
        log.debug("Bắt đầu quét đơn hàng quá hạn thanh toán...");
        LocalDateTime thresholdTime = LocalDateTime.now().minusMinutes(timeoutMinutes);

        // 1. Tìm danh sách đơn hàng PENDING tạo trước thresholdTime
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedDateBefore("PENDING", thresholdTime);

        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("Tìm thấy {} đơn hàng quá hạn thanh toán", expiredOrders.size());

        for (Order order : expiredOrders) {
            // 2. Chuyển trạng thái đơn hàng sang "CANCELLED" và lưu lại
            order.setStatus("CANCELLED");
            orderRepository.save(order);

            // 3. Tạo OrderCancelledEvent
            // Gợi ý: map các order.getItems() (OrderItem) sang danh sách OrderItemEvent
            List<OrderItemEvent> itemEvents = order.getItems().stream()
                    .map(item -> OrderItemEvent.builder()
                            .productId(item.getProductId())
                            .quantity(item.getQuantity())
                            .build())
                    .collect(Collectors.toList());

            OrderCancelledEvent event = OrderCancelledEvent.builder()
                    .orderId(order.getId())
                    .userId(order.getUserId())
                    .voucherCode(order.getVoucherCode())
                    .items(itemEvents)
                    .build();

            // 4. Bắn event đi
            orderEventPublisher.publishOrderCancelledEvent(event);
            log.info("Đơn hàng [{}] đã bị hủy tự động do quá hạn thanh toán.", order.getId());
        }
    }
}