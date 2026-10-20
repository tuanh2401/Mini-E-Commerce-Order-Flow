package com.example.payment_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.entity.PaymentStatus;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends BaseRepository<Payment,String> {
    // Tìm payment theo orderId — dùng khi query trạng thái từ Controller
    Optional<Payment> findByOrderId(String orderId);
    Optional<Payment> findByOrderCode(Long orderCode);
    //Đếm sl giao dịch theo trạng thái
    long countByStatus(PaymentStatus status);
    //Lấy ds giao dịch theo trạng thái
    List<Payment> findByStatus(PaymentStatus status);
}
