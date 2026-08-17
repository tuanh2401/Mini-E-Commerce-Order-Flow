package com.example.payment_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {
    private String orderId;        // Mã đơn hàng cần thanh toán
    private String paymentMethod;  // VNPAY, MOMO, BANK
    private String bankCode;       // Mã ngân hàng (tùy chọn): NCB, TCB, LPB...
}
