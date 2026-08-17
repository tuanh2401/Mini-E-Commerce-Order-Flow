package com.example.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class TopSpenderResponse {
    private Long userId;
    private String fullName;
    private String email;
    private BigDecimal totalSpent;
    private Integer totalOrders;
    private String membershipTier;

}
