package com.example.product_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.product_service.dto.response.FavoriteProductResponse;
import com.example.product_service.entity.FavoriteProduct;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Interface Mapper chuyển đổi tự động giữa FavoriteProduct Entity và FavoriteProductResponse DTO.
 * Tích hợp sử dụng ProductMapper để tự động map thông tin chi tiết sản phẩm.
 */
@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface FavoriteProductMapper extends EntityMapper<Long, FavoriteProductResponse, FavoriteProduct> {

    /**
     * Ghi đè hàm toDto để tự động ánh xạ id của Product thành productId.
     */
    @Override
    @Mapping(source = "product.id", target = "productId")
    FavoriteProductResponse toDto(FavoriteProduct entity);

    /**
     * Ghi đè hàm toEntity để gán ngược productId từ DTO vào thực thể Product.
     */
    @Override
    @Mapping(source = "productId", target = "product.id")
    FavoriteProduct toEntity(FavoriteProductResponse dto);

    /**
     * Ghi đè hàm update.
     */
    @Override
    @Mapping(source = "productId", target = "product.id")
    void updateFromDTO(FavoriteProductResponse dto, @MappingTarget FavoriteProduct entity);
}