package com.example.order_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RevenueDataPoint {
    private String period; //Nhãn khoảng tgian tương ứng
    private BigDecimal revenue; //doanh thu kiếm đc trong khoảng tgian đó
    private long orderCount; //Số lượng đơn hàng đc thanh toán thành công trong khoảng tgian đó
}
