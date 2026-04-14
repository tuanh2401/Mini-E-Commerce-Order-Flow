package com.example.payment_service.repository;

import com.example.lib.base.BaseRepository;
import com.example.payment_service.entity.Payment;

import java.util.Optional;

public interface PaymentRepository extends BaseRepository<Payment,String> {
    // Tìm payment theo orderId — dùng khi query trạng thái từ Controller
    Optional<Payment> findByOrderId(String orderId);

    // Tìm payment theo vnpTxnRef — dùng khi VNPAY gọi IPN callback
    // vnpTxnRef là mã ngắn mà mình tự tạo ra lúc gửi sang VNPAY
    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);
}
