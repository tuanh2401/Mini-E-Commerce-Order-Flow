package com.example.user_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Message {
    SUCCESS_USER_PROFILE("success.user.profile"),
    SUCCESS_USER_UPDATE("success.user.update"),
    SUCCESS_GET("success.get"),
    SUCCESS_USER_SYNC("success.user.sync"),
    ERROR_EMAIL_EXISTS("error.email.exists"),
    USER_NOT_FOUND("user.not.found"),
    SUCCESS_VIEW_ANALYTICS("success.analytics.view");
    private final String message;
}
