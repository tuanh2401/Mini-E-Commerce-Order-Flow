package com.example.order_service.repository;

import org.springframework.stereotype.Repository;
import com.example.order_service.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem , Long> {

}
