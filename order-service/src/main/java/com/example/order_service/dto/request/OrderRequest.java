package com.example.order_service.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private String address;
    private String paymentMethod;
    private List<OrderItemRequest> orderItems;
    private String voucherCode;
}
