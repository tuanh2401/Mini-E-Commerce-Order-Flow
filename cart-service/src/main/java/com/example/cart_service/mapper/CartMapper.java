package com.example.cart_service.mapper;

import com.example.cart_service.dto.response.CartResponse;
import com.example.cart_service.entity.Cart;
import com.example.lib.mapper.EntityMapper;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa Cart Entity và CartResponse DTO.
 * Tích hợp sử dụng CartItemMapper để tự động map danh sách sản phẩm lồng bên trong.
 */
@Mapper(componentModel = "spring", uses = {CartItemMapper.class})
public interface CartMapper extends EntityMapper<Long, CartResponse, Cart> {
}