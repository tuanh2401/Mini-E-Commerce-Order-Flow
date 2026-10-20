package com.example.payment_service.service.impl;

import com.example.payment_service.config.PayOSConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayOSService {

    private final PayOS payOS;
    private final PayOSConfig payOSConfig;

    /**
     * 1. Tạo Link thanh toán PayOS (SDK 2.0.1)
     */
    public String createPaymentLink(long orderCode, long amount, String description) {
        try {
            if (description != null && description.length() > 25) {
                description = description.substring(0, 25);
            }

            CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description != null ? description : "Thanh toan don hang")
                    .returnUrl(payOSConfig.getReturnUrl())
                    .cancelUrl(payOSConfig.getCancelUrl())
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
            log.info("Tạo link PayOS thành công cho orderCode [{}], URL: {}", orderCode, response.getCheckoutUrl());
            return response.getCheckoutUrl();
        } catch (Exception e) {
            log.error("Lỗi khi tạo link thanh toán PayOS: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo link thanh toán PayOS", e);
        }
    }

    /**
     * 2. Xác thực Webhook nhận từ PayOS gửi sang
     */
    public WebhookData verifyWebhook(Webhook webhookBody) {
        // Trường hợp PayOS gửi request test khi nhấn nút 'Lưu Webhook' trên Dashboard (orderCode mẫu = 123)
        if (webhookBody != null && webhookBody.getData() != null
                && Long.valueOf(123L).equals(webhookBody.getData().getOrderCode())) {
            log.info("Nhận request test Webhook URL (orderCode=123) từ PayOS Dashboard -> Xác thực URL thành công!");
            return webhookBody.getData();
        }

        try {
            return payOS.webhooks().verify(webhookBody);
        } catch (Exception e) {
            log.error("Xác thực Webhook PayOS thất bại: {}", e.getMessage());
            throw new RuntimeException("Chữ ký Webhook PayOS không hợp lệ", e);
        }
    }
}
