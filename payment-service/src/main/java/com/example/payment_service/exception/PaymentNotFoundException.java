package com.example.payment_service.exception;

import com.example.lib.model.exception.BaseResourceNotFoundException;

public class PaymentNotFoundException extends BaseResourceNotFoundException {
    public PaymentNotFoundException(Object id) {
        super(Message.PAYMENT_NOT_FOUND.getMessage(),   new Object[]{id});
    }

}
