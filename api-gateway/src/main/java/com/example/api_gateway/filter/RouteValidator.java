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
        "/v3/api-docs",
        "/swagger-ui"
    );
    public Predicate<ServerHttpRequest> isSecured = request -> {
        String path = request.getURI().getPath();
        String method = request.getMethod().name();
        
        // Cho phép GET /api/products/** và GET /api/categories/** công khai không cần token
        if ("GET".equalsIgnoreCase(method)) {
            if((path.startsWith("/api/products") && !path.startsWith("api/products/analytics")) || path.startsWith("/api/categories")) {
                return false;
            }
        }
        
        return openApiEndpoints.stream().noneMatch(uri -> path.contains(uri));
    };
}
