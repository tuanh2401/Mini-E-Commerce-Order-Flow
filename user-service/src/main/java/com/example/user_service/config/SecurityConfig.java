package com.example.user_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tắt CSRF để có thể gọi các phương thức POST, PUT, DELETE mà không bị chặn
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Cấu hình phân quyền (Authorization)
                .authorizeHttpRequests(auth -> auth
                        // Mở toàn bộ các API của user-service để bạn test logic trước
                        .requestMatchers("/api/v1/users/**").permitAll()
                        // Mở các endpoint của hệ thống (Consul, Actuator)
                        .requestMatchers("/actuator/**").permitAll()
                        // Các request còn lại cũng tạm thời cho phép hết
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}
