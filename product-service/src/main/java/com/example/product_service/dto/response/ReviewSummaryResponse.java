package com.example.product_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewSummaryResponse {
    private double averageRating;
    private Long reviewCount;
}
