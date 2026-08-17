package com.example.lib.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProcessedEvent {

    private String orderId;

    // SUCCESS hoặc FAILED
    private String status;

    // Mã giao dịch của cổng thanh toán
    private String transactionId;
}