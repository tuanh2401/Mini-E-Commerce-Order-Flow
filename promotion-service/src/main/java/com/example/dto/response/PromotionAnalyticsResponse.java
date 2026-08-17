package com.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionAnalyticsResponse {
    private long totalVouchers;     // Tổng số voucher trong hệ thống
    private long activeVouchers;    // Số voucher đang hoạt động (isActive = true)
    private long inactiveVouchers;  // Số voucher không còn hoạt động (isActive = false)
    private long totalUsageCount;   // Tổng lượt sử dụng (sum của tất cả usedCount)
    private double avgUsageRate;    // Tỷ lệ sử dụng tb (usedCount / usageLimit * 100)
}