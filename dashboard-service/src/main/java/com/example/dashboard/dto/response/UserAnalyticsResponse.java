package com.example.dashboard.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class UserAnalyticsResponse {
    private long totalUser;
    private Map<String, Long> membershipDistribution;
    private BigDecimal totalRevenueFromUsers;

    public UserAnalyticsResponse() {}

    public long getTotalUser() {
        return totalUser;
    }

    public void setTotalUser(long totalUser) {
        this.totalUser = totalUser;
    }

    public Map<String, Long> getMembershipDistribution() {
        return membershipDistribution;
    }

    public void setMembershipDistribution(Map<String, Long> membershipDistribution) {
        this.membershipDistribution = membershipDistribution;
    }

    public BigDecimal getTotalRevenueFromUsers() {
        return totalRevenueFromUsers;
    }

    public void setTotalRevenueFromUsers(BigDecimal totalRevenueFromUsers) {
        this.totalRevenueFromUsers = totalRevenueFromUsers;
    }
}
