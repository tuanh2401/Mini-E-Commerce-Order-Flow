package com.example.cart_service.controller;

import com.example.cart_service.dto.request.AddToCartRequest;
import com.example.cart_service.dto.request.UpdateCartItemRequest;
import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.service.CartService;
import com.example.lib.model.response.BaseResponse;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * Lấy thông tin giỏ hàng của user đang đăng nhập.
     * URL: GET /api/cart
     */
    @GetMapping
    public ResponseEntity<BaseResponse<CartResponse>> getCart(@Parameter(hidden = true) @RequestHeader("userId") Long userId) {
        log.info("User [{}] đang lấy thông tin giỏ hàng", userId);
        CartResponse data = cartService.getCart(userId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * URL: POST /api/cart/items
     */
    @PostMapping("/items")
    public ResponseEntity<BaseResponse<CartResponse>> addItems(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId,
            @RequestBody AddToCartRequest request) {
        log.info("User [{}] đang yêu cầu thêm sản phẩm [{}] với số lượng [{}] vào giỏ hàng", userId, request.getProductId(), request.getQuantity());
        CartResponse data = cartService.addItem(userId, request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
     * URL: PUT /api/cart/items/{productId}
     */
    @PutMapping("/items/{productId}")
    public ResponseEntity<BaseResponse<CartResponse>> updateItem(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId,
            @PathVariable("productId") Long productId,
            @RequestBody UpdateCartItemRequest request) {
        log.info("User [{}] đang yêu cầu cập nhật số lượng sản phẩm ID {} thành {}", userId, productId, request.getQuantity());
        CartResponse data = cartService.updateItem(userId, productId, request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Xóa một sản phẩm khỏi giỏ hàng.
     * URL: DELETE /api/cart/items/{productId}
     */
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<BaseResponse<CartResponse>> deleteItem(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId,
            @PathVariable("productId") Long productId) {
        log.info("User [{}] đang yêu cầu xóa sản phẩm ID {} khỏi giỏ hàng", userId, productId);
        CartResponse data = cartService.removeItem(userId, productId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * Xóa sạch toàn bộ giỏ hàng.
     * URL: DELETE /api/cart
     */
    @DeleteMapping
    public ResponseEntity<BaseResponse<Void>> clearCart(@Parameter(hidden = true) @RequestHeader("userId") Long userId) {
        log.info("User [{}] yêu cầu xóa sạch giỏ hàng", userId);
        cartService.clearCart(userId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }
}