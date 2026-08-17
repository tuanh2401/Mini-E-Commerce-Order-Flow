package com.example.lib.model.exception;

//Ngoại lệ dùng riêng cho lỗi không tìm thấy dữ liệu
//Ném ra khi truy vấn ID không tồn tại dưới database (ví dụ: không tìm thấy đơn hàng, không tìm thấy sản phẩm).
public class BaseResourceNotFoundException extends RuntimeException {
    private final String messageKey;
    private final Object[] messageArgs;
    public BaseResourceNotFoundException(String messageKey, Object[] messageArgs) {
            super(messageKey);
            this.messageKey = messageKey;
            this.messageArgs = messageArgs;
    }
    public String getMessageKey() {
        return messageKey;
    }
    public Object[] getMessageArgs() {
        return messageArgs;
    }

}
