package com.example.service.impl;

import com.example.dto.response.PromotionAnalyticsResponse;
import com.example.entity.Voucher;
import com.example.repository.VoucherRepository;
import com.example.service.PromotionAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionAnalyticsServiceImpl implements PromotionAnalyticsService {

    private final VoucherRepository voucherRepository;

    @Override
    public PromotionAnalyticsResponse getPromotionSummary() {
        log.info("Bắt đầu tính toán thống kê tổng quan khuyến mãi");

        // 1. Tổng số voucher
        long totalVouchers = voucherRepository.count();

        // 2. Đếm voucher đang active và không active
        long activeVouchers   = voucherRepository.countByIsActiveTrue();
        long inactiveVouchers = voucherRepository.countByIsActiveFalse();

        // 3. Tổng lượt sử dụng — lấy toàn bộ voucher rồi sum usedCount bằng Stream
        List<Voucher> allVouchers = voucherRepository.findAll();

        long totalUsageCount = allVouchers.stream()
                .mapToLong(Voucher::getUsedCount) // Lấy usedCount (int) của từng voucher → mapToLong để cộng dồn
                .sum();

        // 4. Tỷ lệ sử dụng trung bình: (usedCount / usageLimit * 100) của từng voucher rồi tính trung bình
        // Lọc bỏ các voucher có usageLimit = 0 để tránh chia cho 0
        double avgUsageRate = allVouchers.stream()
                .filter(v -> v.getUsageLimit() > 0)
                .mapToDouble(v -> (v.getUsedCount() * 100.0) / v.getUsageLimit())
                .average()
                .orElse(0.0);

        return PromotionAnalyticsResponse.builder()
                .totalVouchers(totalVouchers)
                .activeVouchers(activeVouchers)
                .inactiveVouchers(inactiveVouchers)
                .totalUsageCount(totalUsageCount)
                .avgUsageRate(avgUsageRate)
                .build();
    }
}