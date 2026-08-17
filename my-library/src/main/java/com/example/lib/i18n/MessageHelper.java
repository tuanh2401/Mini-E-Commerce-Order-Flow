package com.example.lib.i18n;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

@Component
public class MessageHelper {

    private final MessageSource messageSource;

    public MessageHelper(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /**
     * Lấy thông điệp đa ngôn ngữ dựa trên message key và các tham số truyền vào
     *
     * @param key  Message key (ví dụ: "product.not.found")
     * @param args Các đối số truyền vào chuỗi (ví dụ: id sản phẩm)
     * @return Chuỗi đã được dịch theo ngôn ngữ hiện tại của request
     */
    public String getMessage(String key, Object... args) {
        return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
    }
}