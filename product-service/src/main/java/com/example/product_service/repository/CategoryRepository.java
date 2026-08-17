package com.example.product_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.product_service.entity.Category;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends BaseRepository<Category, Long> {
    Boolean existsByName(String name);
}
