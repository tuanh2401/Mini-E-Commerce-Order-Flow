package com.example.payment_service.repository;

import com.example.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    // Tìm payment theo orderId — dùng khi query trạng thái từ Controller
    Optional<Payment> findByOrderId(String orderId);

    // Tìm payment theo vnpTxnRef — dùng khi VNPAY gọi IPN callback
    // vnpTxnRef là mã ngắn mà mình tự tạo ra lúc gửi sang VNPAY
    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);
}
