package com.example.cart_service.service;

import com.example.cart_service.dto.request.AddToCartRequest;
import com.example.cart_service.dto.request.UpdateCartItemRequest;
import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entity.Cart;
import com.example.cart_service.mapper.CartMapper;
import com.example.cart_service.repository.CartRepository;
import com.example.lib.service.IBaseService;

/**
 * Interface nghiệp vụ Giỏ hàng kế thừa IBaseService generic.
 */
public interface CartService extends IBaseService<CartRepository, CartResponse, Cart, CartMapper, Long> {

    // 1. Lấy thông tin giỏ hàng của User
    CartResponse getCart(Long userId);

    // 2. Thêm sản phẩm vào giỏ hàng
    CartResponse addItem(Long userId, AddToCartRequest request);

    // 3. Cập nhật số lượng của một sản phẩm trong giỏ hàng
    CartResponse updateItem(Long userId, Long productId, UpdateCartItemRequest request);

    // 4. Xóa một sản phẩm khỏi giỏ hàng
    CartResponse removeItem(Long userId, Long productId);

    // 5. Làm trống giỏ hàng (xóa toàn bộ sản phẩm)
    void clearCart(Long userId);
}