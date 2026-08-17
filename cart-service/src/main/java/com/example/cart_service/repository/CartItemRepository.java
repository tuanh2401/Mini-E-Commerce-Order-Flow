package com.example.cart_service.repository;

import com.example.cart_service.entity.CartItem;
import com.example.lib.repository.BaseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends BaseRepository<CartItem, Long> {
}