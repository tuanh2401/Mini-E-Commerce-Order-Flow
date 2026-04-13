package com.example.payment_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // <--- QUAN TRỌNG: Bật tính năng nhận diện @PreAuthorize ở Controller
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    // Inject filter vừa tạo vào đây
    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập ẩn danh vào các link này:
                        .requestMatchers("/api/payments/vnpay-ipn", "/api/payments/vnpay-callback", "/actuator/**", "/v3/api-docs/**", "/api/payments/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Còn lại tất cả các API khác phải có Authentication (có thẻ mới cho vào)
                        .anyRequest().authenticated()
                )
                // Cài đặt filter của mình vào trước Filter mặc định của Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

