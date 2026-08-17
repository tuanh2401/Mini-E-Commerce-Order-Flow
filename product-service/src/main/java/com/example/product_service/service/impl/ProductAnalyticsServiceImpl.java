package com.example.product_service.service.impl;

import com.example.product_service.dto.response.CategoryDistributionResponse;
import com.example.product_service.dto.response.ProductAnalyticsResponse;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.entity.ProductReview;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.repository.CategoryRepository;
import com.example.product_service.repository.ProductRepository;
import com.example.product_service.repository.ProductReviewRepository;
import com.example.product_service.service.ProductAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductAnalyticsServiceImpl implements ProductAnalyticsService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductReviewRepository productReviewRepository;

    // Tiêm ProductMapper của MapStruct vào để dùng chung
    private final ProductMapper productMapper;

    @Override
    public ProductAnalyticsResponse getProductSummary() {
        long totalProducts = productRepository.count();
        long outOfStockCount = productRepository.countByStock(0);
        long lowStockCount = productRepository.findByStockLessThan(10).size();

        double averageRating = productReviewRepository.findAll()
                .stream()
                .mapToInt(ProductReview::getRating)
                .average()
                .orElse(0.0);
        long totalCategories = categoryRepository.count();

        return ProductAnalyticsResponse.builder()
                .totalProducts(totalProducts)
                .outOfStockCount(outOfStockCount)
                .lowStockCount(lowStockCount)
                .averageRating(averageRating)
                .totalCategories(totalCategories)
                .build();
    }

    @Override
    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findByStockLessThan(threshold)
                .stream()
                // Sử dụng productMapper của MapStruct thay thế cho map thủ công
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getTopRatedProducts(int limit) {
        log.info("Lấy top {} sản phẩm đánh giá cao nhất", limit);

        Map<Product, Double> productRatingMap = productReviewRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        ProductReview::getProduct,
                        Collectors.averagingDouble(ProductReview::getRating)
                ));

        return productRatingMap.entrySet().stream()
                .sorted((entry1, entry2) -> entry2.getValue().compareTo(entry1.getValue()))
                .limit(limit)
                // Sử dụng productMapper của MapStruct thay thế cho map thủ công
                .map(entry -> productMapper.toDto(entry.getKey()))
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDistributionResponse> getCategoryDistribution() {
        log.info("Thống kê số lượng sản phẩm phân bố theo danh mục");
        return categoryRepository.findAll().stream()
                .map(category -> {
                    long productCount = productRepository.findAll().stream()
                            .filter(product -> product.getCategory() != null
                                    && product.getCategory().getId().equals(category.getId()))
                            .count();

                    return CategoryDistributionResponse.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .productCount(productCount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}