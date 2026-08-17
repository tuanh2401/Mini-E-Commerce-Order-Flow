package com.example.api_gateway.filter;

import com.example.lib.util.RsaJwtHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
//ng gác cổng
@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator routeValidator;

    @Autowired
    private RsaJwtHelper rsaJwtHelper;

    @Autowired
    private ReactiveStringRedisTemplate stringRedisTemplate;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            //Logging request entry
            String method = exchange.getRequest().getMethod().name();
            String path = exchange.getRequest().getURI().getPath();
            String traceId = exchange.getRequest().getId();
            Boolean isSecured = routeValidator.isSecured.test(exchange.getRequest());
            log.info("event=gateway.request.recieved, method={}, path={}, isSecured={}", method, path, isSecured);

            // 1. Kiểm tra xem API này có cần bảo mật không
            if(isSecured) {

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
                    // 4. Đưa cho rsaJwtHelper kiểm tra chữ ký và hạn dùng
                    rsaJwtHelper.validateToken(authHeader);
                    String userId = String.valueOf(rsaJwtHelper.extractUserId(authHeader));
                    String username = rsaJwtHelper.extractUsername(authHeader);
                    String role = rsaJwtHelper.extractRole(authHeader);

                    //Kiểm tra BLACKLIST trên redis:
                    String redisKey = "blacklist:user:" + userId;
                    return stringRedisTemplate.hasKey(redisKey)
                            .flatMap(isBlacklisted -> {
                                if(Boolean.TRUE.equals(isBlacklisted)) {
                                    log.warn("Request bị chặn: UserID [{}] nằm trong blacklist", userId);
                                    return onError(exchange, "Tài khoản đã bị vô hiệu hóa hoặc xóa", HttpStatus.UNAUTHORIZED);
                                }
                                //Log xác nhận hợp lệ và định danh người dùng
                                log.info("event=gateway.auth.success, traceId={}, userId={}, username={}, role={}", traceId, userId, username, role);
                                //thay đổi rq và log việc chuyển tiếp header
                                log.debug("event=gateway.header.mutate, traceId={}, targetHeaders=[userId, username, X-User-Role]", traceId);
                                // Order/User Service
                                ServerHttpRequest modifiedRequest = exchange.getRequest()
                                        .mutate()
                                        .header("userId", userId)
                                        .header("userName", username)
                                        .header("X-User-Role", role)
                                        .build();

                                return chain.filter(exchange.mutate().request(modifiedRequest).build());
                            });

                } catch (Exception e) {
                    // Nếu Token sai, in log ra console màu đỏ
                    log.error("event=gateway.auth.failed, traceId={},error={}", traceId, e.getMessage());

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