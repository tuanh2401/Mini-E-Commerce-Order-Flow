package com.example.payment_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import vn.payos.PayOS;

@Configuration
@Data
@ConfigurationProperties(prefix = "payos")
public class PayOSConfig {
    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String returnUrl;
    private String cancelUrl;

    /**
     * Khởi tạo Bean PayOS SDK để có thể tiêm (inject) vào Service sử dụng
     */
    @Bean
    public PayOS payOS() {
        return new PayOS(clientId, apiKey, checksumKey);
    }
}