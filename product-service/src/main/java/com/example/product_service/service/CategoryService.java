package com.example.product_service.service;

import com.example.lib.service.IBaseService;
import com.example.product_service.dto.response.CategoryResponse;
import com.example.product_service.entity.Category;
import com.example.product_service.mapper.CategoryMapper;
import com.example.product_service.repository.CategoryRepository;

/**
 * Interface nghiệp vụ Danh mục kế thừa IBaseService generic.
 */
public interface CategoryService extends IBaseService<CategoryRepository, CategoryResponse, Category, CategoryMapper, Long> {
}