package com.example.order_service.event;
import com.example.lib.dto.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    public void pulishOrderCreatedEvent(OrderCreatedEvent event){
        log.info("--- [MQ] Đang bắn event đơn hàng [{}] sang RabbitMQ ---", event.getOrderId());
        // Gửi tin nhắn đi
        rabbitTemplate.convertAndSend("order.exchange", "order.created", event);

        log.info("--- [MQ] Gửi thành công! ---");
    }
}
