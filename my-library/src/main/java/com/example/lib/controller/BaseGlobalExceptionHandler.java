package com.example.lib.controller;

import com.example.lib.model.dto.ApiResponse;
import com.example.lib.model.exception.BaseResourceNotFoundException;
import com.example.lib.model.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.access.AccessDeniedException;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import feign.FeignException;
@Slf4j
@RestControllerAdvice
//Bắt và tập trung xử lý ex để trả về response
public class BaseGlobalExceptionHandler {

    //Tiêm Messagesource để đọc file i18n
    @Autowired
    protected MessageSource messageSource;
    //Viết các hàm bắt lỗi dùng chung đầu tiên : Lỗi dữ liệu đầu vào (validation)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            Locale locale) {
        //Logic1 : Trích xuất thông báo lỗi mặc định từ exception
        String defaultErrorMsg = ex.getBindingResult()
                .getAllErrors()
                .get(0)
                .getDefaultMessage();
        //Logic 2 : Dùng messageSource để đọc câu "Dữ liệu k hợp lệ: {0}" bằng ngôn ngữ hiện tại\
        //Dùng key "error.validation.failed"
        String localizedMsg = messageSource.getMessage(
                "error.validation.failed",
                new Object[]{defaultErrorMsg},
                locale
        );
        //Logic 3 : Ghi log
        log.error("validation failed : {}", localizedMsg);
        // Logic 4: Trả về ApiResponse
        ApiResponse<Object> response = ApiResponse.error(localizedMsg);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    //k đủ quyền
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException ex , Locale locale){
        String localizedMsg = messageSource.getMessage(
                "error.access.denied",
                null,
                locale
        );
        log.warn("access denied : {}", localizedMsg);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(localizedMsg));

    }
    //sai username/password
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentialsException(BadCredentialsException ex , Locale locale){
        String message = messageSource.getMessage("error.bad.credentials",null,locale);
        log.warn("Authentication failed : {}",ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(message));
    }
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException ex , Locale locale){
        String message = messageSource.getMessage(
                ex.getMessageKey(),
                ex.getMessageArgs(),
                ex.getMessageKey(),
                locale
        );
        log.warn("Business error occurred : {} - Status : {}",message,ex.getHttpStatus());
        return ResponseEntity
                .status(ex.getHttpStatus())
                .body(ApiResponse.error(message));
    }
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ApiResponse<Object>> handleFeignException(FeignException ex , Locale locale){
        String serviceInfo = "HTTP status " + ex.status();
        String localizedMsg = messageSource.getMessage(
                "error.feign.service",
                new Object[]{serviceInfo},
                locale
        );
        log.warn("feign error: status {}, message={}", ex.status(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(ApiResponse.error(localizedMsg));
    }
    //k tìm thấy data
    @ExceptionHandler(BaseResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleBaseResourceNotFoundException(BaseResourceNotFoundException ex, Locale locale) {
        //Trích xuất thông tin từ Exception
        String messageKey = ex.getMessageKey();
        Object[] messageArgs = ex.getMessageArgs();
        //Dịch thông báo dựa trên locale
        String localizedMessage = messageSource.getMessage(messageKey, messageArgs, messageKey, locale);
        //Ghi log trả kết quả
        //Dùng log.warn vì là lỗi logic
        log.warn("resource not found exception : {}", localizedMessage);
        //Giả sử ApiResponse của bạn có static method error hoặc dùng builder
        ApiResponse<Object> apiResponse = ApiResponse.error(localizedMessage);

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(apiResponse);
    }
    //JSON rq bị lỗi format
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, Locale locale){
        String localizedMsg = messageSource.getMessage(
                "error.bad.request.body",
                new Object[]{ex.getMessage()},
                locale
        );
        log.warn("bad request body : {}", localizedMsg);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(localizedMsg));
    }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex, Locale locale) {
        // 1. Log chi tiết lỗi ra console/file để Dev kiểm tra
        log.error("Unhandled Runtime Exception: ", ex);

        // 2. Lấy câu thông báo chung "Lỗi hệ thống" từ i18n
        String localizedMsg = messageSource.getMessage("error.server.internal", null, locale);

        // 3. Trả về lỗi 500 cho khách hàng
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(localizedMsg));
    }
    //Bắt lỗi k lường trước được
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleException(Exception ex, Locale locale) {
        String localizedMsg = messageSource.getMessage(
                "error.server.internal",
                new Object[]{locale.getLanguage()},
                locale
        );
        //thêm log lỗi ở dòng nào
        log.error("internal error : {}", localizedMsg);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(localizedMsg));
    }

    }


