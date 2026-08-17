package com.example.payment_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
@ConfigurationProperties(prefix = "vnpay")
public class VNPAYConfig {
    private String tmnCode;
    private String hashSecret;
    private String url;
    private String returnUrl;
}
