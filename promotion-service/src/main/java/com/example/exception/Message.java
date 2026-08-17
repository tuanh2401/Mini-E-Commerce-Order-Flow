package com.example.exception;

import lombok.Getter;

@Getter
public enum Message {
    VOUCHER_CREATE_SUCCESS("voucher.create.success"),
    VOUCHER_GET_SUCCESS("voucher.get.success"),
    VOUCHER_VALIDATE_SUCCESS("voucher.validate.success"),
    VOUCHER_APPLY_SUCCESS("voucher.apply.success"),
    SUCCESS_VIEW_ANALYTICS("success.analytics.view");
    private String message;
    Message(String message) {
        this.message = message;
    }
}
