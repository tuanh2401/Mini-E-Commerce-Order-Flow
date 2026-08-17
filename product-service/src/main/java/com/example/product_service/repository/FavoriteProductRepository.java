package com.example.product_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.product_service.entity.FavoriteProduct;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteProductRepository extends BaseRepository<FavoriteProduct, Long> {

    List<FavoriteProduct> findByUserId(String userid);

    Optional<FavoriteProduct> findByUserIdAndProductId(String userId, Long productId);

    boolean existsByUserIdAndProductId(String userId, Long productId);
}