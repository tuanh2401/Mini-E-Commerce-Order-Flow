package com.example.dashboard.exception;

public enum Message {
    SUCCESS_VIEW_DASHBOARD("dashboard.success.view");

    private final String message;

    Message(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
