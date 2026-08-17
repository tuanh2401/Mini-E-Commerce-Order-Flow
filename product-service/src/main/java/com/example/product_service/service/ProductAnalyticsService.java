package com.example.product_service.service;

import com.example.product_service.dto.response.CategoryDistributionResponse;
import com.example.product_service.dto.response.ProductAnalyticsResponse;
import com.example.product_service.dto.response.ProductResponse;

import java.util.List;

public interface ProductAnalyticsService {
    //Lấy tổng quan thống kê kho sản phẩm
    ProductAnalyticsResponse getProductSummary();
    //Lấy danh sách sản phẩm sắp hết hàng(product < threshold)
    List<ProductResponse> getLowStockProducts(int threshold);
    //Lấy danh sách sản phẩm được đánh giá cao nhất
    List<ProductResponse> getTopRatedProducts(int limit);
    //Lấy phân bổ số lượng sp theo từng danh mục
    List<CategoryDistributionResponse> getCategoryDistribution();
}
