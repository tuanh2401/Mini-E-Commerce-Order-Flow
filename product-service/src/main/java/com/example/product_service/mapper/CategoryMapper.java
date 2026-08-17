package com.example.product_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.product_service.dto.response.CategoryResponse;
import com.example.product_service.entity.Category;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa Category Entity và CategoryResponse DTO.
 * MapStruct sẽ tự động sinh lớp CategoryMapperImpl lúc compile.
 */
@Mapper(componentModel = "spring")
public interface CategoryMapper extends EntityMapper<Long, CategoryResponse, Category> {
}