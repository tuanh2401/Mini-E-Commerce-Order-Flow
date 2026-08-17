package com.example.order_service.exception;

import com.example.lib.model.exception.BaseResourceNotFoundException;

public class OrderNotFoundException extends BaseResourceNotFoundException {
    public OrderNotFoundException(Object id) {
        super(Message.ORDER_NOT_FOUND.getMessage(), new Object[]{id});
    }
}
