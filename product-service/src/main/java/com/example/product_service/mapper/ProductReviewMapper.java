package com.example.product_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.product_service.dto.response.ReviewResponse;
import com.example.product_service.entity.ProductReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Interface Mapper chuyển đổi tự động giữa ProductReview Entity và ReviewResponse DTO.
 * Tự động tạo lớp triển khai ProductReviewMapperImpl lúc compile.
 */
@Mapper(componentModel = "spring")
public interface ProductReviewMapper extends EntityMapper<Long, ReviewResponse, ProductReview> {

    /**
     * Ghi đè hàm toDto:
     * 1. Ánh xạ product.id -> productId
     * 2. Chuyển chuỗi String images -> List<String>
     */
    @Override
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "images", target = "images", qualifiedByName = "stringToImages")
    ReviewResponse toDto(ProductReview entity);

    /**
     * Ghi đè hàm toEntity:
     * 1. Ánh xạ ngược productId -> product.id
     * 2. Chuyển List<String> images -> chuỗi String
     */
    @Override
    @Mapping(source = "productId", target = "product.id")
    @Mapping(source = "images", target = "images", qualifiedByName = "imagesToString")
    ProductReview toEntity(ReviewResponse dto);

    /**
     * Ghi đè hàm update
     */
    @Override
    @Mapping(source = "productId", target = "product.id")
    @Mapping(source = "images", target = "images", qualifiedByName = "imagesToString")
    void updateFromDTO(ReviewResponse dto, @MappingTarget ProductReview entity);

    // ================= HELPER METHODS CHUYỂN ĐỔI ẢNH =================

    @Named("imagesToString")
    default String imagesToString(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return String.join(",", images);
    }

    @Named("stringToImages")
    default List<String> stringToImages(String images) {
        if (images == null || images.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(images.split(","));
    }
}