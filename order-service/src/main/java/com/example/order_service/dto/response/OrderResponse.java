package com.example.order_service.dto.response;

import com.example.order_service.dto.response.OrderItemResponse;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private String id;
    private Long userId;
    private String userName;
    private BigDecimal totalPrice;
    private String status;
    private LocalDateTime createdAt;
    private String address;
    private String paymentMethod;
    private List<OrderItemResponse> items;
}
