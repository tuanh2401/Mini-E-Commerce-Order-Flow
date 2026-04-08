package com.example.order_service.controller;


import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    // Api tạo đơn hàng mới với method "post" url "/api/orders"
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader("userId") long userId, @RequestBody OrderRequest request) {
        log.info("User có ID [{}] đang yêu cầu tạo đơn hàng mới", userId);
        log.debug("Chi tiết giỏ hàng gửi lên: {}", request);
        //Gọi service thực hiện nghiệp vụ tính tiền + lưu DB sau đó lấy kết quả ResponseDTO phản hồi lại khách
        OrderResponse response = orderService.createOrder(userId,request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<?> getOrders(@RequestHeader("userId") long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }
}

