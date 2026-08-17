package com.example.product_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.product_service.dto.response.ReviewResponse;
import com.example.product_service.entity.ProductReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Interface Mapper chuyển đổi tự động giữa ProductReview Entity và ReviewResponse DTO.
 * Tự động tạo lớp triển khai ProductReviewMapperImpl lúc compile.
 */
@Mapper(componentModel = "spring")
public interface ProductReviewMapper extends EntityMapper<Long, ReviewResponse, ProductReview> {

    /**
     * Ghi đè hàm toDto để tự động ánh xạ id của Product lồng bên trong thành productId ở DTO.
     */
    @Override
    @Mapping(source = "product.id", target = "productId")
    ReviewResponse toDto(ProductReview entity);

    /**
     * Ghi đè hàm toEntity để gán ngược productId từ DTO vào thực thể Product lồng bên trong.
     */
    @Override
    @Mapping(source = "productId", target = "product.id")
    ProductReview toEntity(ReviewResponse dto);

    /**
     * Ghi đè hàm update để khi cập nhật đánh giá, nếu thay đổi productId
     * thì cũng cập nhật đúng trường product.id của Entity.
     */
    @Override
    @Mapping(source = "productId", target = "product.id")
    void updateFromDTO(ReviewResponse dto, @MappingTarget ProductReview entity);
}