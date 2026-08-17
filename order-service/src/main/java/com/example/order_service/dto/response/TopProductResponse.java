package com.example.order_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopProductResponse {
    private Long productId;
    private long totalQuantitySold; //tổng số lg sp đã bán ra thành công
    private BigDecimal totalRevenue; //tổng doanh thu đc riêng từ sp
}
