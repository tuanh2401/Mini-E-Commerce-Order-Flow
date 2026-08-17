package com.example.payment_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import lombok.*;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse extends BaseDto<String> {

    private String orderId;
    private Long userId;
    private BigDecimal amount;
    private String status;
    private String paymentMethod;
    private String transactionId;
}