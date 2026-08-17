package com.example.payment_service.service;

import com.example.lib.model.dto.OrderCreatedEvent;
import com.example.lib.service.IBaseService;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.mapper.PaymentMapper;
import com.example.payment_service.repository.PaymentRepository;

import java.util.Map;

/**
 * Interface nghiệp vụ Thanh toán kế thừa IBaseService generic.
 */
public interface PaymentService extends IBaseService<PaymentRepository, PaymentResponse, Payment, PaymentMapper, String> {

    // 1. Tạo bản ghi thanh toán mới từ Event đặt hàng của RabbitMQ (trạng thái PENDING)
    void createPaymentFromEvent(OrderCreatedEvent event);

    // 2. Tạo đường dẫn URL thanh toán qua cổng VNPAY
    String createVNPAYUrl(PaymentRequest request, String ipAddress, Long currentUserId);

    // 3. Xử lý dữ liệu phản hồi (IPN Callback) từ cổng VNPAY gửi về
    Map<String, String> processVNPAYResult(Map<String, String> params);

    // 4. Lấy thông tin thanh toán theo mã đơn hàng OrderId
    PaymentResponse getPaymentByOrderId(String orderId, Long currentUserId, String role);
}