package com.example.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
//White-List : route k cần JWT
public class RouteValidator {
    public static final List<String> openApiEndpoints = List.of(
        "/api/auth/authenticate",
        "/api/auth/register",
        "/api/auth/social-login",
        "/api/auth/social-register",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/auth/verify",
        "/api/auth/reject",
        "/api/auth/register-admin",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/find-account",
        "/v3/api-docs",
        "/swagger-ui"
    );
    public Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();
        String method = request.getMethod().name();
        
        // Cho phép GET /api/products/** (ngoại trừ analytics, banners/all và badges/all), GET /api/categories/**, GET /api/promotions/active công khai
        if ("GET".equalsIgnoreCase(method)) {
            if((path.startsWith("/api/products") && !path.startsWith("/api/products/analytics") && !path.startsWith("/api/products/banners/all") && !path.startsWith("/api/products/badges/all")) || path.startsWith("/api/categories") || path.startsWith("/api/promotions/active")) {
                return false;
            }
        }
        
        return openApiEndpoints.stream().noneMatch(uri -> path.equals(uri) || path.startsWith(uri + "/"));
    };
}
