package com.example.notification_service.service;

import com.example.lib.model.dto.EmailVerificationEvent;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    @Value("${app.email.verification-template}")
    private String emailTemplate;
    private final JavaMailSender mailSender;
    //Gửi email chữa link tới client
    public void sendVerificationEmail(EmailVerificationEvent event) {
        log.info("Bắt đầu xử lý email xác thực cho tài khoản : {}",event.getUsername());
        try{
            //Khởi tạo mimemessage để hỗ trợ định dạng html
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            //Dùng MimeMessageHelper với cờ thứ 2 là true (multipart) và bảng mã UTF-8 để k bị lỗi TV
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,true,"UTF-8");
            //Cấu hình các thông tin gửi thư
            helper.setTo(event.getEmail());
            helper.setSubject("Kích hoạt tài khoản mới Mini E-Commerce");
            // 3. Xây dựng URL trỏ về Frontend
            String token = event.getVerificationToken();
            String verificationUrl = "http://localhost:8082/api/auth/verify?token=" + token;
            String rejectUrl = "http://localhost:8082/api/auth/reject?token=" + token;
            //tạo nd email từ template cấu hình
            String htmlContent = String.format(emailTemplate,event.getUsername(),verificationUrl,rejectUrl);
            helper.setText(htmlContent,true);
            // 5. Thực hiện gửi mail qua SMTP Server
            mailSender.send(mimeMessage);
            log.info("Gửi email kích hoạt dạng HTML tới địa chỉ [{}] thành công!", event.getEmail());

        } catch (Exception e) {
            log.error("Đã xảy ra lỗi khi gửi email kích hoạt đến [{}]. Chi tiết : {}", event.getEmail(), e.getMessage(), e);
        }
    }
}
