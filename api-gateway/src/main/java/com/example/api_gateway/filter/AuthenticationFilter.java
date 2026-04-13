package com.example.api_gateway.filter;

import com.example.api_gateway.exception.JwtAuthenticationException;
import com.example.lib.util.JwtHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtHelper jwtHelper;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {

            // 1. Kiểm tra xem API này có cần bảo mật không
            if (validator.isSecured.test(exchange.getRequest())) {

                // 2. Kiểm tra xem người dùng có gửi Header "Authorization" không
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    // Gọi hàm onError để trả về JSON báo lỗi
                    return onError(exchange, "Thiếu Header Authorization", HttpStatus.UNAUTHORIZED);
                }

                // 3. Lấy chuỗi Token ra
                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    // 4. Đưa cho JwtHelper kiểm tra chữ ký và hạn dùng
                    jwtHelper.validateToken(authHeader);
                    String userId = String.valueOf(jwtHelper.extractUserId(authHeader));
                    String username = jwtHelper.extractUsername(authHeader);
                    String role = jwtHelper.extractRole(authHeader);
                    // Order/User Service
                    org.springframework.http.server.reactive.ServerHttpRequest modifiedRequest = exchange.getRequest()
                            .mutate()
                            .header("userId", userId)
                            .header("username", username)
                            .header("X-User-Role", role)
                            .build();

                    return chain.filter(exchange.mutate().request(modifiedRequest).build());

                } catch (Exception e) {
                    // Nếu Token sai, in log ra console màu đỏ
                    JwtAuthenticationException customException = new JwtAuthenticationException(
                            "Lỗi xác thực Token: " + e.getMessage());
                    System.err.println(customException.getMessage());

                    // Gọi hàm onError để trả về JSON báo lỗi cho Postman/Frontend
                    return onError(exchange, "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED);
                }
            }

            // 5. Nếu mọi thứ OK, cho phép Request đi tiếp
            return chain.filter(exchange);
        });
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();

        // Gắn mã lỗi
        response.setStatusCode(httpStatus);

        // Báo cho Postman biết đây là kiểu định dạng JSON
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Tự tay code cục JSON ở đây
        String body = "{\"status\": " + httpStatus.value() + ", \"error\": \"" + httpStatus.getReasonPhrase()
                + "\", \"message\": \"" + err + "\"}";

        // Ép sang DataBuffer (Bắt buộc với WebFlux)
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));

        // Trả về luồng kết thúc
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
    }
}