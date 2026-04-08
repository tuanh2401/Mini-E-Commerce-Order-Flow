package com.example.lib.dto;

import java.util.List;

public class OrderCreatedEvent {
    private String orderId;
    private Long userId;
    private List<OrderItemEvent> items;

    public OrderCreatedEvent() {}

    public OrderCreatedEvent(String orderId, Long userId, List<OrderItemEvent> items) {
        this.orderId = orderId;
        this.userId = userId;
        this.items = items;
    }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<OrderItemEvent> getItems() { return items; }
    public void setItems(List<OrderItemEvent> items) { this.items = items; }
}
