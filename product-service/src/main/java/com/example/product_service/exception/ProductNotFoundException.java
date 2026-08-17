package com.example.product_service.exception;
import com.example.lib.model.exception.BaseResourceNotFoundException;

public class ProductNotFoundException extends BaseResourceNotFoundException {
    public ProductNotFoundException(Object id) {
        super(Message.PRODUCT_NOT_FOUND.getMessage(), new Object[]{id});
    }
}
