package com.example.cart_service.service.impl;

import com.example.cart_service.client.ProductClient;
import com.example.cart_service.dto.request.AddToCartRequest;
import com.example.cart_service.dto.request.UpdateCartItemRequest;
import com.example.cart_service.dto.response.CartItemResponse;
import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.dto.response.ProductResponse;
import com.example.cart_service.entity.Cart;
import com.example.cart_service.entity.CartItem;
import com.example.cart_service.mapper.CartMapper;
import com.example.cart_service.repository.CartRepository;
import com.example.cart_service.service.CartService;
import com.example.lib.model.response.BaseResponse;
import com.example.cart_service.repository.CartItemRepository;
import com.example.lib.model.exception.BaseResourceNotFoundException;
import com.example.lib.service.BaseService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;

@Slf4j
@Service
@Transactional
public class CartServiceImpl extends BaseService<CartRepository, CartResponse, Cart, CartMapper, Long> implements CartService {

    private final ProductClient productClient;
    private final CartItemRepository cartItemRepository;

    // Tiêm các dependency cần thiết.
    // CartRepository và CartMapper đã tự động được tiêm ở BaseService cha.
    public CartServiceImpl(ProductClient productClient, CartItemRepository cartItemRepository) {
        this.productClient = productClient;
        this.cartItemRepository = cartItemRepository;
    }

    /**
     * Hàm phụ trợ sử dụng MapStruct để map dữ liệu từ Cart Entity sang CartResponse DTO
     * Đồng thời tự động tính toán tổng tiền và tổng số sản phẩm trong giỏ.
     */
    private CartResponse enrichAndMapCart(Cart cart) {
        if (cart == null) {
            CartResponse response = new CartResponse();
            response.setItems(Collections.emptyList());
            response.setTotalPrice(BigDecimal.ZERO);
            response.setTotalItems(0);
            return response;
        }

        // Gọi MapStruct mapper của lớp cha để sinh DTO phẳng
        CartResponse response = mapper.toDto(cart);

        if (response.getItems() != null && !response.getItems().isEmpty()) {
            // Tính tổng tiền = sum(price * quantity)
            BigDecimal totalPrice = response.getItems().stream()
                    .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Tính tổng số lượng mặt hàng trong giỏ
            int totalItems = response.getItems().stream()
                    .mapToInt(CartItemResponse::getQuantity)
                    .sum();

            response.setTotalPrice(totalPrice);
            response.setTotalItems(totalItems);
        } else {
            response.setTotalPrice(BigDecimal.ZERO);
            response.setTotalItems(0);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = repository.findByUserId(userId).orElse(null);
        return enrichAndMapCart(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        // 1. Gọi Feign sang product-service lấy chi tiết sản phẩm
        BaseResponse<ProductResponse> productApi = productClient.getProductById(request.getProductId());
        if (productApi == null || productApi.getData() == null) {
            log.error("Không tìm thấy sản phẩm có ID: {} từ Product Service", request.getProductId());
            throw new BaseResourceNotFoundException("error.cart.product.not.found", new Object[]{request.getProductId()});
        }
        ProductResponse product = productApi.getData();

        // 2. Tìm hoặc khởi tạo giỏ hàng cho User
        Cart cart = repository.findByUserId(userId).orElse(null);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
            cart.setItems(new ArrayList<>());
        }

        // 3. Kiểm tra sản phẩm đã có trong giỏ chưa
        Long targetProductId = request.getProductId();
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(targetProductId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Đã có thì cộng thêm số lượng
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
        } else {
            // Chưa có thì thêm mới CartItem liên kết vào list con
            CartItem newItem = new CartItem();
            newItem.setProductId(product.getId());
            newItem.setProductName(product.getName());
            newItem.setPrice(product.getPrice());
            newItem.setImageUrl(product.getImageUrl());
            newItem.setQuantity(request.getQuantity());
            newItem.setCart(cart);
            cart.getItems().add(newItem);
        }

        Cart savedCart = repository.save(cart);
        log.info("Đã thêm sản phẩm [{}] vào giỏ hàng của user [{}] thành công", product.getName(), userId);
        return enrichAndMapCart(savedCart);
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long userId, Long productId, UpdateCartItemRequest request) {
        Cart cart = repository.findByUserId(userId)
                .orElseThrow(() -> new BaseResourceNotFoundException("error.cart.not.found", new Object[]{userId}));

        CartItem targetItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("Sản phẩm ID {} không tồn tại trong giỏ hàng của user {}", productId, userId);
                    return new BaseResourceNotFoundException("error.cart.product.not.found", new Object[]{productId});
                });

        int newQuantity = request.getQuantity();
        if (newQuantity <= 0) {
            // Nếu số lượng cập nhật <= 0, xóa mềm sản phẩm khỏi giỏ hàng
            targetItem.setDeletedAt(LocalDateTime.now());
            cartItemRepository.save(targetItem);
            cart.getItems().remove(targetItem);
            log.info("Đã xóa mềm thành công sản phẩm ID {} khỏi giỏ hàng của user {} vì số lượng <= 0", productId, userId);
        } else {
            targetItem.setQuantity(newQuantity);
            log.info("Đã cập nhật số lượng sản phẩm ID {} thành {} cho User {}", productId, newQuantity, userId);
        }

        Cart updatedCart = repository.save(cart);
        return enrichAndMapCart(updatedCart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long productId) {
        Cart cart = repository.findByUserId(userId)
                .orElseThrow(() -> new BaseResourceNotFoundException("error.cart.not.found", new Object[]{userId}));

        CartItem targetItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> {
                    log.warn("Yêu cầu xóa sản phẩm ID {} nhưng không tìm thấy sản phẩm trong giỏ của User {}", productId, userId);
                    return new BaseResourceNotFoundException("error.cart.item.not.found", new Object[]{productId});
                });

        targetItem.setDeletedAt(LocalDateTime.now());
        cartItemRepository.save(targetItem);
        cart.getItems().remove(targetItem);

        Cart updatedCart = repository.save(cart);
        log.info("Đã xóa mềm sản phẩm ID {} khỏi giỏ hàng của User {} thành công", productId, userId);
        return enrichAndMapCart(updatedCart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = repository.findByUserId(userId).orElse(null);
        if (cart != null) {
            for (CartItem item : cart.getItems()) {
                item.setDeletedAt(LocalDateTime.now());
                cartItemRepository.save(item);
            }
            cart.getItems().clear();
            repository.save(cart);
            log.info("Đã xóa sạch giỏ hàng (xóa mềm toàn bộ items) của User {}", userId);
        }
    }
}