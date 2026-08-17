package com.example.product_service.repository;

import com.example.lib.repository.BaseRepository;
import com.example.product_service.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends BaseRepository<ProductReview,Long> {
    //Lấy ds review phân trang
    Page<ProductReview> findByProductId(Long productId, Pageable pageable);
    //Lấy tất cả review của sản phẩm
    List<ProductReview> findByProductId(Long productId);
    //Tìm review của 1 user cụ thể nào đó của 1 sản phẩm (để sửa/cập nhật)
    Optional<ProductReview> findByUserIdAndProductId(String  userId, Long productId);
    //Kiểm tra xem user đã review sản phẩm chưa
    boolean existsByUserIdAndProductId(String  userId, Long productId);
    //Đếm tổng số review của 1 sản phẩm
    long countByProductId(Long productId);
}
