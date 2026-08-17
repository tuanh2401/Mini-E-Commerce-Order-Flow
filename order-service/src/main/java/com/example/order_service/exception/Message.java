package com.example.order_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Message {
    ORDER_CREATE_SUCCESS("success.order.create"),
    ORDER_LIST_SUCCESS("success.order.list"),
    ORDER_DETAIL_SUCCESS("success.order.detail"),
    ORDER_NOT_FOUND("order.not.found"),
    ORDER_EMPTY("error.order.empty"),
    VOUCHER_INVALID("error.voucher.invalid"),
    VOUCHER_APPLY_FAILED("error.voucher.apply.failed"),
    SUCCESS_VIEW_ANALYTICS("success.analytics.view");
    private final String message;
}
