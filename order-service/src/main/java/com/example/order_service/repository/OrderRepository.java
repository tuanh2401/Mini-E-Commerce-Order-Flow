package com.example.order_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.order_service.entity.Order;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends BaseRepository<Order, String> {

    // Tìm danh sách đơn hàng theo UserId
    List<Order> findByUserId(Long userId);

    // Đếm đơn hàng theo trạng thái
    long countByStatus(String status);

    // Lọc đơn hàng theo trạng thái và thời gian tạo
    List<Order> findByStatusAndCreatedDateBetween(String status, LocalDateTime start, LocalDateTime end);

    // Lọc đơn hàng theo khoảng thời gian tạo
    List<Order> findByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

    // Lấy top 10 đơn hàng mới nhất
    List<Order> findTop10ByOrderByCreatedDateDesc();

    List<Order> findByStatusAndCreatedDateBefore(String status , LocalDateTime dateTime);
}