package com.example.user_service.exception;

import com.example.lib.model.exception.BaseResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends BaseResourceNotFoundException {
    public ResourceNotFoundException(Object id) {
        super(Message.USER_NOT_FOUND.getMessage(), new Object[]{id});
    }
}
