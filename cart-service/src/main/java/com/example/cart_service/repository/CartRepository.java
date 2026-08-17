package com.example.cart_service.repository;

import com.example.cart_service.entity.Cart;
import com.example.lib.repository.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends BaseRepository<Cart, Long> {

    // Tìm kiếm giỏ hàng theo UserId
    Optional<Cart> findByUserId(Long userId);
}