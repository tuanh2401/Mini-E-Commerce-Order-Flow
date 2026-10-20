package com.example.notification_service.event;

import com.example.lib.model.dto.EmailVerificationEvent;
import com.example.notification_service.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailEventListener {
    private final EmailService emailService;

    // 1. Lắng nghe từ RabbitMQ (Kích hoạt tài khoản khi đăng ký)
    @RabbitListener(queues = "${rabbitmq.queue.email-verification}")
    public void listenEmailVerificationEvent(EmailVerificationEvent event) {
        log.info("Nhận được sự kiện xác thực tài khoản từ RabbitMQ | Username = [{}] , Email = [{}]", event.getUsername(), event.getEmail());
        try {
            emailService.sendVerificationEmail(event);
            log.info("==> Xử lý sự kiện gửi email cho tài khoản [{}] hoàn tất.", event.getUsername());
        } catch (Exception e) {
            log.error("==> Lỗi nghiêm trọng xảy ra khi xử lý sự kiện của tài khoản [{}]: {}", event.getUsername(), e.getMessage(), e);
        }
    }

    // 2. Lắng nghe từ Kafka (Gửi mã OTP 6 số khi yêu cầu đổi Email / Quên mật khẩu)
    @KafkaListener(topics = "send-otp-email-topic", groupId = "notification-group")
    public void listenSendOtpEmailKafka(EmailVerificationEvent event) {
        log.info("🔥 [KAFKA - NOTIFICATION] Nhận yêu cầu gửi mã OTP tới Email: [{}], Tên: [{}]", event.getEmail(), event.getUsername());
        try {
            emailService.sendOtpEmail(event);
            log.info("==> [KAFKA - NOTIFICATION] Xử lý gửi OTP qua Gmail thành công.");
        } catch (Exception e) {
            log.error("==> [KAFKA - NOTIFICATION] Lỗi gửi OTP: {}", e.getMessage(), e);
        }
    }

    // 3. Lắng nghe từ Kafka (Gửi thông tin Tên tài khoản khi Quên tài khoản)
    @KafkaListener(topics = "send-find-account-email-topic", groupId = "notification-group")
    public void listenSendFindAccountEmailKafka(EmailVerificationEvent event) {
        log.info("🔥 [KAFKA - NOTIFICATION] Nhận yêu cầu gửi Tên tài khoản tới Email: [{}]", event.getEmail());
        try {
            emailService.sendAccountInfoEmail(event);
            log.info("==> [KAFKA - NOTIFICATION] Xử lý gửi thông tin tài khoản qua Gmail thành công.");
        } catch (Exception e) {
            log.error("==> [KAFKA - NOTIFICATION] Lỗi gửi thông tin tài khoản: {}", e.getMessage(), e);
        }
    }
}
