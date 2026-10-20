package com.example.payment_service.service;

import com.example.lib.model.dto.OrderCreatedEvent;
import com.example.lib.service.IBaseService;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.mapper.PaymentMapper;
import com.example.payment_service.repository.PaymentRepository;
import vn.payos.model.webhooks.Webhook;

public interface PaymentService extends IBaseService<PaymentRepository, PaymentResponse, Payment, PaymentMapper, String> {
    void createPaymentFromEvent(OrderCreatedEvent event);

    String createPayOSUrl(PaymentRequest request, String ipAddress, Long currentUserId);

    void processPayOSWebhook(Webhook webhookBody);

    PaymentResponse getPaymentByOrderId(String orderId, Long currentUserId, String role);
}
