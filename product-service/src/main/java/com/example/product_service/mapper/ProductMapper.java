package com.example.product_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Category;
import com.example.product_service.entity.Product;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


 //Interface Mapper chuyển đổi qua lại giữa Product Entity và ProductResponse DTO.
 //Tự động tạo lớp triển khai ProductMapperImpl lúc compile.
@Mapper(componentModel = "spring")
public interface ProductMapper extends EntityMapper<Long, ProductResponse, Product> {

    @Override
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductResponse toDto(Product entity);

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toEntity(ProductResponse dto);

    @Override
    @Mapping(target = "category", ignore = true)
    void updateFromDTO(ProductResponse dto, @MappingTarget Product entity);
}