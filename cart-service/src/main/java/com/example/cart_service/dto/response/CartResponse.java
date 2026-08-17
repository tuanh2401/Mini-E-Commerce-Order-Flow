package com.example.cart_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse extends BaseDto<Long> {

    private Long userId;

    // Danh sách các sản phẩm đang có trong giỏ hàng
    private List<CartItemResponse> items;

    private BigDecimal totalPrice;

    // Tổng số lượng sản phẩm trong giỏ
    private int totalItems;
}