package com.example.lib.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BaseErrorCode {
    INTERNAL_ERROR("EV-500"),       // Lỗi máy chủ hệ thống
    BAD_REQUEST("EV-400"),          // Dữ liệu gửi lên không hợp lệ
    UNAUTHORIZED("EV-401"),         // Chưa xác thực đăng nhập
    FORBIDDEN("EV-403"),            // Đã đăng nhập nhưng không có quyền truy cập
    SUCCESS("EV-200"),              // Thực hiện thành công
    NOT_FOUND("EV-404"),            // Không tìm thấy tài nguyên
    METHOD_NOT_ALLOWED("EV-405"),   // Phương thức HTTP không được hỗ trợ
    FAILURE("EV-999"),              // Thao tác thất bại chung
    COMMON_ERROR("common.internal_error"),
    ACCESS_DENIED("common.access_denied");
    // Mã lỗi dạng String gửi về cho client
    private final String errorCode;
}
