package com.example.lib.model.request;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BaseRequest<T> {
    @Valid
    private T data;
    //Kênh gửi yêu cầu(web , mobile ,...)
    private String channel;
    //Chữ ký số dùng để xác thực tính toàn vẹn của dữ liệu (thường dùng cho API bảo mật).
    private String signature;
}
