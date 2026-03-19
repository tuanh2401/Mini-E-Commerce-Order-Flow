package com.example.order_service.dto.request;

import com.example.order_service.entity.OrderItem;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    private String customerId;
    private String address;
    private String paymentMethod;
    private List<OrderItemRequest> orderItems;
}
