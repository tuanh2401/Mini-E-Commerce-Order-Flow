package com.example.order_service.service;

import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    //Tạo 1 đơn hàng mới
    OrderResponse createOrder(Long userId, OrderRequest orderRequest);
    OrderResponse getOrderById(String id);
    //Lấy lịch sử đơn hàng của 1 người dùng
    List<OrderResponse> getOrdersByUserId(Long userId);
    
    //Lấy tất cả đơn hàng (Dành cho Admin)
    List<OrderResponse> getAllOrders();

}
