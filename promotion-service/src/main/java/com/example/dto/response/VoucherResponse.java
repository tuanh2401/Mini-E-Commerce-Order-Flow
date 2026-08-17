package com.example.dto.response;

import com.example.lib.model.dto.BaseDto;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse extends BaseDto<Long> {

    private String code;
    private BigDecimal discountAmount;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private int usageLimit;
    private int usedCount;
    private Boolean isActive;
    private String minMembershipTier;
}