package com.example.lib.model.exception;
import lombok.Getter;
import org.springframework.http.HttpStatus;
//Ngoại lệ dùng cho các lỗi logic nghiệp vụ.
//Ném ra khi người dùng vi phạm quy tắc nghiệp vụ (ví dụ: dùng voucher hết hạn, điền mật khẩu cũ sai).
@Getter
public class BusinessException extends RuntimeException {
    private final HttpStatus httpStatus;
    private final String messageKey;
    private final Object[] messageArgs;
    /**
     * Hàm khởi tạo BusinessException
     *
     * @param status      Mã lỗi HTTP tương ứng (ví dụ: 400 Bad Request, 404 Not Found)
     * @param messageKey  Mã định danh thông báo lỗi để tra cứu trong i18n/properties
     * @param messageArgs Các tham số động để truyền vào câu thông báo
     */
    public BusinessException(HttpStatus httpStatus, String messageKey, Object[] messageArgs) {
        super(messageKey);
        this.httpStatus = httpStatus; //trả về lỗi (400,404,422,..)
        this.messageKey = messageKey;//Key để tra cứu trong file đa ngôn ngữ (vd : order.not.found)
        this.messageArgs = messageArgs;//các tham số động(vd:id đơn hàng) để điền thông tin đầu vào
    }

}
