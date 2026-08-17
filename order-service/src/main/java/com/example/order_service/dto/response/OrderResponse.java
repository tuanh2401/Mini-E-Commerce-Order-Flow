package com.example.order_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse extends BaseDto<String> {

    private Long userId;
    private String userName;
    private BigDecimal totalPrice;
    private String status;
    private String address;
    private String paymentMethod;
    private List<OrderItemResponse> items;
    private String voucherCode;
    private BigDecimal discountAmount;
}