package com.example.auth_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Message
{
    SUCCESS_LOGIN("success.login"),
    SUCCESS_REGISTER("success.register"),
    SUCCESS_VERIFY("success.verify"),
    SUCCESS_REJECT("success.reject"),
    ERROR_ACCOUNT_NOT_VERIFIED("error.account.not_verified"),
    ERROR_USERNAME_EXISTS("error.username.exists"),
    ERROR_EMAIL_EXISTS("error.email.exists"),
    ERROR_VERIFICATION_TOKEN_NOT_FOUND("error.verification_token.not_found"),
    ERROR_EMAIL_ALREADY_VERIFIED("error.email.already_verified"),
    ERROR_VERIFICATION_TOKEN_EXPIRED("error.verification_token.expired"),
    ERROR_BAD_CREDENTIALS("error.bad.credentials");
    private final String message;
}
