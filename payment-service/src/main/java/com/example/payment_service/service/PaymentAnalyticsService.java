package com.example.payment_service.service;

import com.example.payment_service.dto.response.PaymentAnalyticsResponse;

public interface PaymentAnalyticsService {
    PaymentAnalyticsResponse getPaymentSummary();
}