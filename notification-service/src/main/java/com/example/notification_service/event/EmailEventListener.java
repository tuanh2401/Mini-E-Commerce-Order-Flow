package com.example.notification_service.event;

import com.example.lib.model.dto.EmailVerificationEvent;
import com.example.notification_service.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {
    private final EmailService emailService;
    @RabbitListener(queues = "${rabbitmq.queue.email-verification}")
    public void listenEmailVerificationEvent(EmailVerificationEvent event) {
        log.info("Nhận được sự kiện xác thực tài khoản từ RabbitMQ | Username = [{}] , Email = [{}]",event.getUsername(),event.getEmail());
        try {
            //ủy thác việc xử lý logic soạn và gửi mail cho EmailService
            emailService.sendVerificationEmail(event);
            log.info("==> Xử lý sự kiện gửi email cho tài khoản [{}] hoàn tất.",event.getUsername());
        } catch (Exception e) {
            log.error("==> Lỗi nghiêm trọng xảy ra khi xử lý sự kiện của tài khoản [{}]: {}",event.getUsername(),e.getMessage(),e);
        }
    }
}
