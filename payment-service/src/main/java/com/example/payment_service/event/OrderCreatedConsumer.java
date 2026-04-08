package com.example.payment_service.event;

import com.example.lib.dto.OrderCreatedEvent;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderCreatedConsumer {
    private final PaymentService paymentService;
    //Lắng nghe queue riêng của payment-service
    @RabbitListener(queues = "order.created.payment")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("--- [MQ] Payment nhận được OrderCreatedEvent, orderId = {} ---",event.getOrderId());
        //Gọi service để tạo bản ghi payment với trạng thái pending
        paymentService.createPaymentFromEvent(event);
        log.info("--- [MQ] Đã tạo Payment PENDING cho đơn hàng {} ---", event.getOrderId());
    }
}
