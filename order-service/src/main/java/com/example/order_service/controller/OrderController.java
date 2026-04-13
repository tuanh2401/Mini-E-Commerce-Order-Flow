package com.example.order_service.controller;


import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    // Api tạo đơn hàng mới với method "post" url "/api/orders"
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createOrder(
            @io.swagger.v3.oas.annotations.Parameter(hidden = true) @RequestHeader("userId") long userId, 
            @RequestBody OrderRequest request) {
        log.info("User có ID [{}] đang yêu cầu tạo đơn hàng mới", userId);
        log.debug("Chi tiết giỏ hàng gửi lên: {}", request);
        //Gọi service thực hiện nghiệp vụ tính tiền + lưu DB sau đó lấy kết quả ResponseDTO phản hồi lại khách
        OrderResponse response = orderService.createOrder(userId,request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getOrders(
            @io.swagger.v3.oas.annotations.Parameter(hidden = true) @RequestHeader(value = "userId", required = false) Long headerUserId,
            @io.swagger.v3.oas.annotations.Parameter(description = "Nhập ID User cần xem : ") @RequestParam(value = "userId", required = false) Long queryUserId,
            org.springframework.security.core.Authentication authentication) {
            
        // Kiểm tra xem User hiện tại có quyền ADMIN trong Spring Security Context hay không
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
        if (isAdmin) {
            if (queryUserId != null) {
                // Nếu ADMIN truyền ?userId=.. trên URL thì lấy riềng người đó
                return ResponseEntity.ok(orderService.getOrdersByUserId(queryUserId));
            }
            // Nếu không truyền gì thì lấy TẤT CẢ
            return ResponseEntity.ok(orderService.getAllOrders());
        }
        
        // Nếu là USER thường: CƯỠNG CHẾ dùng headerUserId (ID thật của họ), phớt lờ query param 
        if (headerUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Thiếu userId trong header");
        }
        return ResponseEntity.ok(orderService.getOrdersByUserId(headerUserId));
    }
    
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getOrderById(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // --- API NỘI BỘ DÀNH CHO FEIGN CLIENT ---
    @GetMapping("/internal/{orderId}")
    public ResponseEntity<?> getInternalOrderById(@PathVariable String orderId) {
        log.info("[Nội bộ] Payment Service đang lấy thông tin Đơn hàng ID: {}", orderId);
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

}

