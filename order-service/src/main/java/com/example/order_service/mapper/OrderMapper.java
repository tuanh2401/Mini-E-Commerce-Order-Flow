package com.example.order_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.entity.Order;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa Order Entity và OrderResponse DTO.
 * Tích hợp sử dụng OrderItemMapper để tự động map danh sách mặt hàng lồng bên trong.
 */
@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderMapper extends EntityMapper<String, OrderResponse, Order> {
}