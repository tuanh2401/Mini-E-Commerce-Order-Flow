package com.example.lib.model.response;

import com.example.lib.model.enums.BaseErrorCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseResponse<T> {
    // Dữ liệu trả về thực tế
    private T data;
    // Trạng thái HTTP (Ví dụ: 200 OK, 400 BAD_REQUEST, 404 NOT_FOUND)
    private HttpStatus status;
    // Mã lỗi nghiệp vụ (mặc định là thành công "EV-200")
    private String errorCode = BaseErrorCode.SUCCESS.getErrorCode();
    // Thông điệp phản hồi gửi kèm (thường là thông báo thành công hoặc nội dung lỗi)
    private String message;
    /**
     * Hàm tiện ích tạo nhanh phản hồi Thành công.
     */
    public static <T> BaseResponse<T> success(HttpStatus status, T data) {
        return new BaseResponse<>(data, status, BaseErrorCode.SUCCESS.getErrorCode(), status.name());
    }
    /**
     * Hàm tiện ích tạo nhanh phản hồi Thất bại.
     */
    public static <T> BaseResponse<T> fail(HttpStatus status, String message) {
        return new BaseResponse<>(null, status, BaseErrorCode.FAILURE.getErrorCode(), message);
    }
}
