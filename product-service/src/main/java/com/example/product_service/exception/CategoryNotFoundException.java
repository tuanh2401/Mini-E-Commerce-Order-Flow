package com.example.product_service.exception;

import com.example.lib.model.exception.BaseResourceNotFoundException;

public class CategoryNotFoundException extends BaseResourceNotFoundException {
    public CategoryNotFoundException(Object id) {
            super(Message.CATEGORY_NOT_FOUND.getMessage(), new Object[]{id});
    }
}
