package com.example.payment_service.service;

import com.example.lib.dto.OrderCreatedEvent;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.PaymentResponse;

import java.util.Map;

public interface PaymentService {

    // ① Consumer RabbitMQ gọi khi nhận OrderCreatedEvent từ order-service
    //    → Tạo bản ghi Payment với status = PENDING
    void createPaymentFromEvent(OrderCreatedEvent event);

    // ② Controller gọi khi Frontend muốn lấy link thanh toán VNPAY
    //    → Trả về URL để redirect người dùng sang trang VNPAY
    String createVNPAYUrl(PaymentRequest request, String ipAddress);

    // ③ Controller gọi khi VNPAY gửi IPN (thông báo kết quả thanh toán bất đồng bộ)
    //    → Xác thực chữ ký, cập nhật status DB, bắn event RabbitMQ
    Map<String, String> processVNPAYResult(Map<String, String> params);

    // ④ Controller gọi để query trạng thái thanh toán của một đơn hàng
    PaymentResponse getPaymentByOrderId(String orderId);
}
