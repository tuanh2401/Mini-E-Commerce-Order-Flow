package com.example.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAnalyticsResponse {
    private long totalUser;
    private Map<String, Long> membershipDistribution; //vd bronze :50ng
    private BigDecimal totalRevenueFromUsers; //totalspent của user
}
