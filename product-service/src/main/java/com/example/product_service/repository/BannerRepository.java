package com.example.product_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.product_service.entity.Banner;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends BaseRepository<Banner, Long> {
    @Query("SELECT b FROM Banner b WHERE b.active = true AND b.deletedAt IS NULL ORDER BY b.displayOrder ASC, b.id DESC")
    List<Banner> findByActiveTrueOrderByDisplayOrderAscIdDesc();

    @Query("SELECT b FROM Banner b WHERE b.deletedAt IS NULL ORDER BY b.displayOrder ASC, b.id DESC")
    List<Banner> findAllByOrderByDisplayOrderAscIdDesc();
}
