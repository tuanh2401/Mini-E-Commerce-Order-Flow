package com.example.product_service.service;

import com.example.lib.service.IBaseService;
import com.example.product_service.dto.response.ReviewResponse;
import com.example.product_service.dto.response.ReviewSummaryResponse;
import com.example.product_service.entity.ProductReview;
import com.example.product_service.mapper.ProductReviewMapper;
import com.example.product_service.repository.ProductReviewRepository;

/**
 * Interface nghiệp vụ Đánh giá sản phẩm kế thừa IBaseService generic.
 */
public interface ProductReviewService extends IBaseService<ProductReviewRepository, ReviewResponse, ProductReview, ProductReviewMapper, Long> {

    //phương thức nghiệp vụ đặc thù để thống kê sao của sản phẩm
    ReviewSummaryResponse getReviewSummary(Long productId);
}