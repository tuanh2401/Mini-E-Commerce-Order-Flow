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
    @Value("${app.email.otp-template}")
    private String otpTemplate;
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
    // 2. Gửi email chứa mã OTP xác thực thay đổi Email
    public void sendOtpEmail(EmailVerificationEvent event) {
        log.info("Bắt đầu gửi email chứa mã OTP tới hòm thư: {}", event.getEmail());
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(event.getEmail());
            helper.setSubject("Mã xác minh đổi địa chỉ Email - DungThamMobile");
            String username = (event.getUsername() != null && !event.getUsername().isEmpty())
                    ? event.getUsername() : "Quý khách";
            // Điền username và mã OTP vào 2 vị trí %s trong template YAML
            String htmlContent = String.format(otpTemplate, username, event.getVerificationToken());
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("==> Đã gửi email chứa mã OTP [{}] tới [{}] thành công!", event.getVerificationToken(), event.getEmail());
        } catch (Exception e) {
            log.error("💥 Lỗi khi gửi email OTP đến [{}]. Chi tiết: {}", event.getEmail(), e.getMessage(), e);
        }
    }

    // 3. Gửi email chứa thông tin Tên đăng nhập (Username) khi người dùng quên tài khoản
    public void sendAccountInfoEmail(EmailVerificationEvent event) {
        log.info("Bắt đầu gửi email thông tin Tên tài khoản tới hòm thư: {}", event.getEmail());
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(event.getEmail());
            helper.setSubject("Thông tin Tên tài khoản - DungThamMobile");

            String fullname = (event.getVerificationToken() != null && !event.getVerificationToken().isEmpty())
                    ? event.getVerificationToken() : "Quý khách";
            String username = event.getUsername();

            String html = "<div style=\"font-family: Arial, sans-serif; max-width: 550px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;\">"
                    + "<div style=\"text-align: center; margin-bottom: 20px;\">"
                    + "<h2 style=\"color: #dc2626; margin: 0; font-size: 24px;\">DungThamMobile</h2>"
                    + "<p style=\"color: #64748b; font-size: 13px; margin-top: 5px;\">Hệ thống phân phối điện thoại & phụ kiện chính hãng</p>"
                    + "</div>"
                    + "<p style=\"font-size: 15px; color: #334155;\">Xin chào <strong>" + fullname + "</strong>,</p>"
                    + "<p style=\"font-size: 14px; color: #475569; line-height: 1.6;\">Chúng tôi nhận được yêu cầu tìm lại thông tin tài khoản đăng nhập của bạn.</p>"
                    + "<div style=\"background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px; text-align: center; margin: 25px 0;\">"
                    + "<div style=\"font-size: 13px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; font-weight: 600;\">Tên đăng nhập (Username) của bạn</div>"
                    + "<div style=\"font-size: 24px; font-weight: bold; color: #1e293b; letter-spacing: 1px;\">" + username + "</div>"
                    + "</div>"
                    + "<p style=\"font-size: 13px; color: #64748b; line-height: 1.5;\">Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận chăm sóc khách hàng để được hỗ trợ.</p>"
                    + "<div style=\"margin-top: 25px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;\">"
                    + "© 2026 DungThamMobile. Mọi quyền được bảo lưu."
                    + "</div>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(mimeMessage);
            log.info("==> Đã gửi email thông tin Tên tài khoản [{}] tới [{}] thành công!", username, event.getEmail());
        } catch (Exception e) {
            log.error("💥 Lỗi khi gửi email thông tin tài khoản đến [{}]. Chi tiết: {}", event.getEmail(), e.getMessage(), e);
        }
    }
}
