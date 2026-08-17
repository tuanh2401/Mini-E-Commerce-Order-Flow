package com.example.dashboard.listener;

import com.example.lib.model.dto.OrderCreatedEvent;
import com.example.dashboard.service.DashboardService;
import com.example.lib.model.dto.OrderPaidEvent;
import com.example.lib.model.dto.PaymentProcessedEvent;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class DashboardEventListener {

    private final DashboardService dashboardService;

    public DashboardEventListener(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Lắng nghe sự kiện tạo đơn hàng mới từ order-service
     */
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "dashboard.order.created.queue", durable = "true"),
            exchange = @Exchange(value = "order.exchange", type = "topic"),
            key = "order.created"
    ))
    public void handleOrderCreatedEvent(OrderCreatedEvent event) {
        System.out.println("--- [SSE] Đã nhận sự kiện có đơn hàng mới: " + event.getOrderId() + " ---");
        System.out.println("--- [SSE] Tiến hành gọi 5 API nội bộ để tính lại Data và push lên Frontend ---");

        // Gọi hàm SSE đẩy data mới nhất xuống cho toàn bộ các màn hình Dashboard đang mở
        dashboardService.pushRealtimeUpdate();
    }






}
