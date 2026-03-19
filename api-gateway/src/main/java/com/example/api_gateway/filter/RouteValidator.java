package com.example.api_gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {
    //Danh sách các API không cần kiểm tra JWT(Public endpoints)
    public static final List<String> openApiEndpoints = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/eureka", // cho phép eureka hoạt động
        "/v3/api-docs",
        "/swagger-ui"
    );
    // Hàm ktra : Trả về True nếu rq cần phải kiểm tra Token (Không nằm trong danh sách)
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints.stream().noneMatch(uri -> request.getURI().getPath().contains(uri));
}
