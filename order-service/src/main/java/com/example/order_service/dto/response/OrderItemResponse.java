package com.example.order_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import lombok.*;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse extends BaseDto<Long> {

    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal price;
}