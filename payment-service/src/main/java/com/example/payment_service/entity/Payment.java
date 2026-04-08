package com.example.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "order_id", nullable = false)
    private String orderId;             // UUID từ order-service

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)        // Lưu "PENDING" thay vì số 0
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "payment_method")
    private String paymentMethod;       // VNPAY, MOMO, ...

    @Column(name = "vnp_txn_ref")
    private String vnpTxnRef;           // Mã tham chiếu giao dịch gửi sang VNPAY

    @Column(name = "transaction_id")
    private String transactionId;       // Mã giao dịch VNPAY trả về sau khi thanh toán

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
