package com.example.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAnalyticsResponse {
    private long totalProducts;
    private long outOfStockCount; //số sp hết hàng
    private long lowStockCount; //số sp sắp hết hàng (vd set <10)
    private double averageRating; //Rating tb của toàn bộ sp
    private long totalCategories; //Tổng số danh mục đang có
}
