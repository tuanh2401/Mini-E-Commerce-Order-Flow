package com.example.lib.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//Thiết lập bộ lọc Spring Security và phân quyền URL cho từng Microservice
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@ConditionalOnClass(name = "org.springframework.security.config.annotation.web.builders.HttpSecurity")
public class BaseSecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    @Value("${security.public-endpoints:}")
    private String[] publicEndpoints;

    public BaseSecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    private String[] getValidPublicEndpoints() {
        if (publicEndpoints == null || publicEndpoints.length == 0 || (publicEndpoints.length == 1 && publicEndpoints[0].trim().isEmpty())) {
            return new String[0];
        }
        return publicEndpoints;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                        auth.requestMatchers("/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/**")
                        .permitAll();
                        
                        // Cho phép các yêu cầu GET công khai tới sản phẩm và danh mục
                        auth.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**").permitAll();
                        auth.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**").permitAll();
                        
                        String[] validEndpoints = getValidPublicEndpoints();
                        if (validEndpoints.length > 0) {
                            auth.requestMatchers(validEndpoints).permitAll();
                        }
                        auth.anyRequest().authenticated();
                })
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();

    }

}
