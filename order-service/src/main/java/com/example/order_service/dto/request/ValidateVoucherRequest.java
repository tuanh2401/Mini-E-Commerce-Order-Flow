package com.example.order_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateVoucherRequest {
    private String code;
    private BigDecimal orderTotalValue;
    private Long userId;
}
