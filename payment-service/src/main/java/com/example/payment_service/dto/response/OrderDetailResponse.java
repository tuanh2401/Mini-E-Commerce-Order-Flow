package com.example.payment_service.dto.response;

import lombok.Data;
import java.math.BigDecimal;

/**
 * DTO nhận dữ liệu trả về từ order-service qua Feign Client.
 * Chỉ cần các trường mà payment-service quan tâm.
 */
@Data
public class OrderDetailResponse {
    private String id;
    private Long userId;
    private BigDecimal totalPrice;  // Số tiền cần thanh toán — quan trọng nhất
    private String status;
    private String paymentMethod;
}
