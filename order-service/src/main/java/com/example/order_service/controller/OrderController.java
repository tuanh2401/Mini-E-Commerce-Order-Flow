package com.example.order_service.controller;

import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.response.BaseResponse;
import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.service.OrderService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController  {

    private final OrderService orderService;

    /**
     * Api tạo đơn hàng mới.
     * URL: POST /api/orders
     */
    @PostMapping
    @PreAuthorize("@ss.hasPermission('ORDER_CREATE')")
    public ResponseEntity<BaseResponse<OrderResponse>> createOrder(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId,
            @RequestBody OrderRequest orderRequest) {
        int itemCount = (orderRequest.getOrderItems() != null) ? orderRequest.getOrderItems().size() : 0;
        log.info("UserID [{}] đang yêu cầu tạo đơn hàng mới với {} mặt hàng", userId, itemCount);

        OrderResponse orderResponse = orderService.createOrder(userId, orderRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success(HttpStatus.CREATED, orderResponse));
    }

    /**
     * Lấy danh sách đơn hàng (phân quyền nâng cao).
     * URL: GET /api/orders
     */
    @GetMapping
    @PreAuthorize("@ss.hasPermission('ORDER_VIEW')")
    public ResponseEntity<BaseResponse<List<OrderResponse>>> getOrders(
            @Parameter(hidden = true) @RequestHeader(value = "userId", required = false) Long headerUserId,
            @Parameter(description = "Nhập ID User cần xem: ") @RequestParam(value = "userId", required = false) Long queryUserId,
            Authentication authentication) {

        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            log.info("ADMIN đang truy vấn danh sách đơn hàng. Filter queryUserId: {}", queryUserId != null ? queryUserId : "ALL");
        } else {
            log.info("USER [{}] đang truy vấn danh sách đơn hàng của chính mình", headerUserId);
        }

        List<OrderResponse> data;
        if (isAdmin) {
            if (queryUserId != null) {
                data = orderService.getOrdersByUserId(queryUserId);
            } else {
                data = orderService.getAllOrders();
            }
        } else {
            if (headerUserId == null) {
                log.warn("Truy cập bị từ chối: Thiếu userId trong header cho yêu cầu xem danh sách đơn hàng");
                throw new BusinessException(HttpStatus.UNAUTHORIZED, "error.unauthorized", null);
            }
            data = orderService.getOrdersByUserId(headerUserId);
        }

        log.info("Trả về danh sách đơn hàng thành công. Số lượng: {}", data.size());
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Xem chi tiết đơn hàng (hỗ trợ phân quyền).
     * URL: GET /api/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("@ss.hasPermission('ORDER_VIEW')")
    public ResponseEntity<BaseResponse<OrderResponse>> getOrderById(
            @PathVariable String orderId,
            @Parameter(hidden = true) @RequestHeader("userId") Long currentUserId,
            @Parameter(hidden = true) @RequestHeader("X-User-Role") String role) {
        log.info("Yêu cầu xem chi tiết đơn hàng ID: [{}] từ User: [{}] với Role [{}]", orderId, currentUserId, role);

        OrderResponse data = orderService.getOrderById(orderId, currentUserId, role);
        log.info("Lấy thông tin chi tiết đơn hàng [{}] thành công.", orderId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * API NỘI BỘ (Feign Client gọi) xem chi tiết đơn hàng.
     * URL: GET /api/orders/internal/{orderId}
     */
    @GetMapping("/internal/{orderId}")
    public ResponseEntity<BaseResponse<OrderResponse>> getInternalOrderById(@PathVariable String orderId) {
        log.info("[Nội bộ] Payment Service đang lấy thông tin Đơn hàng ID: {}", orderId);
        OrderResponse data = orderService.getOrderById(orderId, 0L, "ADMIN");
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * API NỘI BỘ (Feign Client gọi) kiểm tra lịch sử mua hàng.
     * URL: GET /api/orders/internal/has-purchased
     */
    @GetMapping("/internal/has-purchased")
    public ResponseEntity<BaseResponse<Boolean>> hasPurchasedProduct(
            @RequestParam("userId") Long userId,
            @RequestParam("productId") Long productId) {
        log.info("[Nội bộ] Product Service kiểm tra lịch sử mua hàng của user [{}] cho sản phẩm [{}]", userId, productId);
        boolean hasPurchased = orderService.hasPurchasedProduct(userId, productId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, hasPurchased));
    }
}