package com.example.payment_service.service.impl;

import com.example.payment_service.dto.response.PaymentAnalyticsResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.entity.PaymentStatus;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.service.PaymentAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentAnalyticsServiceImpl implements PaymentAnalyticsService {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentAnalyticsResponse getPaymentSummary() {
        log.info("Bắt đầu tính toán thống kê tổng quan thanh toán");

        // 1. Đếm tổng số giao dịch
        long totalPayments = paymentRepository.count();

        // 2. Đếm từng loại trạng thái — dùng countByStatus với PaymentStatus enum
        long successfulPayments = paymentRepository.countByStatus(PaymentStatus.SUCCESS);
        long failedPayments     = paymentRepository.countByStatus(PaymentStatus.FAILED);
        long cancelledPayments  = paymentRepository.countByStatus(PaymentStatus.CANCELLED);
        long pendingPayments    = paymentRepository.countByStatus(PaymentStatus.PENDING);

        // 3. Tỷ lệ thành công (tránh chia cho 0 nếu chưa có giao dịch nào)
        double successRate = totalPayments > 0
                ? (successfulPayments * 100.0) / totalPayments
                : 0.0;

        // 4. Tổng tiền của các giao dịch thành công dùng Stream
        BigDecimal totalAmountProcessed = paymentRepository.findByStatus(PaymentStatus.SUCCESS)
                .stream()
                .map(Payment::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PaymentAnalyticsResponse.builder()
                .totalPayments(totalPayments)
                .successfulPayments(successfulPayments)
                .failedPayments(failedPayments)
                .cancelledPayments(cancelledPayments)
                .pendingPayments(pendingPayments)
                .successRate(successRate)
                .totalAmountProcessed(totalAmountProcessed)
                .build();
    }
}