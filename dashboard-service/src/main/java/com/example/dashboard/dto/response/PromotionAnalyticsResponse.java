package com.example.dashboard.dto.response;

public class PromotionAnalyticsResponse {
    private long totalVouchers;
    private long activeVouchers;
    private long inactiveVouchers;
    private long totalUsageCount;
    private double avgUsageRate;

    public PromotionAnalyticsResponse() {}

    public long getTotalVouchers() { return totalVouchers; }
    public void setTotalVouchers(long totalVouchers) { this.totalVouchers = totalVouchers; }

    public long getActiveVouchers() { return activeVouchers; }
    public void setActiveVouchers(long activeVouchers) { this.activeVouchers = activeVouchers; }

    public long getInactiveVouchers() { return inactiveVouchers; }
    public void setInactiveVouchers(long inactiveVouchers) { this.inactiveVouchers = inactiveVouchers; }

    public long getTotalUsageCount() { return totalUsageCount; }
    public void setTotalUsageCount(long totalUsageCount) { this.totalUsageCount = totalUsageCount; }

    public double getAvgUsageRate() { return avgUsageRate; }
    public void setAvgUsageRate(double avgUsageRate) { this.avgUsageRate = avgUsageRate; }
}
