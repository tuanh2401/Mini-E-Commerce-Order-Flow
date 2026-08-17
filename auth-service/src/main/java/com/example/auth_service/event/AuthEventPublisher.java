package com.example.auth_service.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.example.lib.model.dto.EmailVerificationEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.email}")
    private String emailExchange;

    @Value("${rabbitmq.routing-key.email-verification}")
    private String emailRoutingKey;

    public void publishEmailVerificationEvent(EmailVerificationEvent emailVerificationEvent) {
        log.info("Đang gửi sự kiện xác thực email tới RabbitMQ cho người dùng : {}",emailVerificationEvent.getUsername());
        try{
            //Gửi tin nhắn lên exchange kèm routing key
            rabbitTemplate.convertAndSend(
                    emailExchange,
                    emailRoutingKey,
                    emailVerificationEvent
            );
            log.info("Đã gửi thành công EmailEvent cho Email : {}",emailVerificationEvent   .getEmail());
        }catch (Exception e){
            log.error("Lỗi xảy ra khi gửi EmailEvent lên RabbitMQ: {}",e.getMessage());
        }
    }
}
