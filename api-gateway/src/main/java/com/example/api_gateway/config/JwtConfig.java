package com.example.api_gateway.config;

import com.example.lib.util.JwtHelper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    public static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @Bean
    public JwtHelper jwtHelper() {
        return new JwtHelper(SECRET);
    }
}
