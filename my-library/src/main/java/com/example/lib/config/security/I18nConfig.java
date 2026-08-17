package com.example.lib.config.security;

import com.example.lib.i18n.MessageHelper;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
//Khởi tạo bộ giải quyết ngôn ngữ(Locale Resolver) và tệp tin thông điệp
@Configuration
public class I18nConfig {
    @Bean
    public MessageHelper messageHelper(MessageSource messageSource){
        return new MessageHelper(messageSource);
    }
}
