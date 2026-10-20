package com.example.payment_service.event;

import com.example.lib.model.dto.PaymentProcessedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentEventPublisher {
    private final KafkaTemplate kafkaTemplate;
    private final RabbitTemplate rabbitTemplate;

    public void publishPaymentProcessed(PaymentProcessedEvent event) {
        log.info("--- [MQ] Gửi PaymentProcessedEvent, orderId = {}, status = {} ---",
                event.getOrderId(), event.getStatus());

        rabbitTemplate.convertAndSend("payment.exchange", "payment.processed", event);
        //Bắn sự kiện lên kafka
        kafkaTemplate.send("payment-processed-topic",event.getOrderId(),event);
        log.info("--- [MQ] Gửi thành công! ---");
    }
}
