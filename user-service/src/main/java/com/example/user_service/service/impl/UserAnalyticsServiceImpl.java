package com.example.user_service.service.impl;

import com.example.user_service.dto.response.TopSpenderResponse;
import com.example.user_service.dto.response.UserAnalyticsResponse;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAnalyticsServiceImpl  implements UserAnalyticsService {
    private final UserRepository userRepository;
    @Override
    public UserAnalyticsResponse getUserSummary() {
        log.info("Bắt đầu tính toán thống kê tổng quan người dùng");
        long totalUsers = userRepository.count();
        //Tính tổng doanh từ từ tất cả user
        BigDecimal totalRevenue = userRepository.findAll().stream()
                .map(User::getTotalSpent)
                .filter(spent -> spent != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        //Thống kê phân bổ user theo hạng thành viên
        Map<String, Long> membershipDistribution = userRepository.findAll().stream()
                .filter(user -> user.getMembershipTier() != null)
                .collect(Collectors.groupingBy(
                        user -> user.getMembershipTier().name(),
                        Collectors.counting()
                ));
        return UserAnalyticsResponse.builder()
                .totalUser(totalUsers)
                .membershipDistribution(membershipDistribution)
                .totalRevenueFromUsers(totalRevenue)
                .build();
    }
    @Override
    public List<TopSpenderResponse> getTopSpender(int limit) {
        log.info("Bắt đầu lấy danh sách top {} khách hàng chi tiêu nhiều nhất");
        return userRepository.findAll().stream()
                .filter(user -> user.getTotalSpent() != null)
                .sorted((u1, u2) -> u2.getTotalSpent().compareTo(u1.getTotalSpent()))
                .limit(limit)
                .map(this::mapToTopSpenderResponse)
                .collect(Collectors.toList());
    }
    private TopSpenderResponse mapToTopSpenderResponse(User user) {
        return TopSpenderResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullname())
                .email(user.getEmail())
                .totalSpent(user.getTotalSpent())
                .totalOrders(user.getTotalOrders())
                .membershipTier(user.getMembershipTier() != null ? user.getMembershipTier().name() : null)
                .build();
    }
}
