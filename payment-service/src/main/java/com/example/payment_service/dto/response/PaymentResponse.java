package com.example.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private String id;             // ID bản ghi payment
    private String orderId;        // Mã đơn hàng liên kết
    private Long userId;           // ID người dùng
    private BigDecimal amount;     // Số tiền
    private String status;         // PENDING / SUCCESS / FAILED / CANCELLED
    private String paymentMethod;  // VNPAY, MOMO, BANK
    private String transactionId;  // Mã giao dịch từ đối tác thanh toán trả về
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
