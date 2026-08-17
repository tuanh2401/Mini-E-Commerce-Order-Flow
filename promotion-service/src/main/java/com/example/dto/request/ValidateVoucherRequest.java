package com.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class ValidateVoucherRequest {
    private String code;
    private BigDecimal orderTotalValue; //tổng gtri đơn hàng hiện tại để tính mức giảm tương ứng
    private Long userId;
}
