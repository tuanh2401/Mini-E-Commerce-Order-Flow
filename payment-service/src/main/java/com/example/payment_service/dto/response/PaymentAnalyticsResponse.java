package com.example.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAnalyticsResponse {
    private long totalPayments;           // Tổng số giao dịch
    private long successfulPayments;      // Số giao dịch SUCCESS
    private long failedPayments;          // Số giao dịch FAILED
    private long cancelledPayments;       // Số giao dịch CANCELLED
    private long pendingPayments;         // Số giao dịch PENDING
    private double successRate;           // Tỷ lệ thành công (%)
    private BigDecimal totalAmountProcessed; // Tổng tiền giao dịch SUCCESS
}