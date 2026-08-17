package com.example.order_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.order_service.dto.response.OrderItemResponse;
import com.example.order_service.entity.OrderItem;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa OrderItem Entity và OrderItemResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface OrderItemMapper extends EntityMapper<Long, OrderItemResponse, OrderItem> {
}