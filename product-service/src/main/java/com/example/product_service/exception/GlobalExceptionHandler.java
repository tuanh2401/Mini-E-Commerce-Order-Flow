package com.example.product_service.exception;

import com.example.lib.dto.ApiResponse;
import com.example.lib.exception.ErrorInfo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Bắt lỗi chung chung kiểu RuntimeException (Ví dụ: "Không tìm thấy sản
    // phẩm")
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {
        ErrorInfo errorInfo = new ErrorInfo(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorInfo.getMessage()));
    }

    // 2. Bắt lỗi nhập liệu từ người dùng (Validation, ví dụ: Quên nhập tên, hoặc
    // nhập giá < 0)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        // Trích xuất các lỗi validation ra để gởi chung vào 1 cục
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorInfo errorInfo = new ErrorInfo(
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Dữ liệu nhập vào không hợp lệ: " + errors.toString());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(errorInfo.getMessage()));
    }
}
