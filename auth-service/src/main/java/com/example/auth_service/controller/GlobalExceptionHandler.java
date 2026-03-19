package com.example.auth_service.controller;

import com.example.lib.exception.ErrorInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Trả về lỗi rõ ràng khi test thiếu body, sai format, hoặc validation fail.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Body thiếu hoặc không phải JSON đúng format (username, password) */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorInfo> handleMissingBody(HttpMessageNotReadableException e) {
        ErrorInfo body = new ErrorInfo("Thiếu hoặc sai định dạng body",
                "Gửi JSON: {\"username\": \"...\", \"password\": \"...\"}");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** Validation fail (username/password trống theo @NotBlank) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorInfo> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        ErrorInfo body = new ErrorInfo("Dữ liệu không hợp lệ", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** Catch-all for RuntimeException and others */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorInfo> handleAllExceptions(Exception e) {
        ErrorInfo body = new ErrorInfo("Lỗi Server hoặc Lỗi Logic", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
