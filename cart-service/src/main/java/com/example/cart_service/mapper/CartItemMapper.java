package com.example.cart_service.mapper;

import com.example.cart_service.dto.response.CartItemResponse;
import com.example.cart_service.entity.CartItem;
import com.example.lib.mapper.EntityMapper;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa CartItem Entity và CartItemResponse DTO.
 * Tự sinh CartItemMapperImpl khi compile.
 */
@Mapper(componentModel = "spring")
public interface CartItemMapper extends EntityMapper<Long, CartItemResponse, CartItem> {
}