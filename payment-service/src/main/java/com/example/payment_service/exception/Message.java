package com.example.payment_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Message {
    FETCH_RESULT_SUCCESS("payment.status.fetch.success"),
    PAYMENT_NOT_FOUND("payment.not.found"),
    PAYMENT_CREATE_SUCCESS("payment.create.success"),
    SUCCESS_VIEW_ANALYTICS("success.analytics.view");

    private final String message;
}

