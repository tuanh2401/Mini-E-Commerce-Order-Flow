package com.example.lib.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
//Dto dùng để truyền dữ liệu trong event giữa các service
public class OrderCreatedEvent {

    private String orderId;
    private Long userId;
    private List<OrderItemEvent> items;
}