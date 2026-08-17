package com.example.order_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.order_service.entity.OrderItem;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends BaseRepository<OrderItem, Long> {
}