package com.example.product_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.product_service.entity.PromoBadge;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromoBadgeRepository extends BaseRepository<PromoBadge, Long> {
    @Query("SELECT b FROM PromoBadge b WHERE b.active = true AND b.deletedAt IS NULL ORDER BY b.displayOrder ASC, b.id ASC")
    List<PromoBadge> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    @Query("SELECT b FROM PromoBadge b WHERE b.deletedAt IS NULL ORDER BY b.displayOrder ASC, b.id ASC")
    List<PromoBadge> findAllByOrderByDisplayOrderAscIdAsc();
}
