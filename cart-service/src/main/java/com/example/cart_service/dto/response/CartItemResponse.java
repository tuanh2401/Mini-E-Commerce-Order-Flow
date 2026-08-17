package com.example.cart_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import lombok.*;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse extends BaseDto<Long> {

    private Long productId;
    private String productName;
    private BigDecimal price;
    private int quantity;
    private String imageUrl;
}