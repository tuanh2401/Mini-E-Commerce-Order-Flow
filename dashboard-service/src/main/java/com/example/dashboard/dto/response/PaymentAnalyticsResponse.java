package com.example.dashboard.dto.response;

import java.math.BigDecimal;

public class PaymentAnalyticsResponse {
    private long totalPayments;
    private long successfulPayments;
    private long failedPayments;
    private long cancelledPayments;
    private long pendingPayments;
    private double successRate;
    private BigDecimal totalAmountProcessed;

    public PaymentAnalyticsResponse() {}

    public long getTotalPayments() { return totalPayments; }
    public void setTotalPayments(long totalPayments) { this.totalPayments = totalPayments; }

    public long getSuccessfulPayments() { return successfulPayments; }
    public void setSuccessfulPayments(long successfulPayments) { this.successfulPayments = successfulPayments; }

    public long getFailedPayments() { return failedPayments; }
    public void setFailedPayments(long failedPayments) { this.failedPayments = failedPayments; }

    public long getCancelledPayments() { return cancelledPayments; }
    public void setCancelledPayments(long cancelledPayments) { this.cancelledPayments = cancelledPayments; }

    public long getPendingPayments() { return pendingPayments; }
    public void setPendingPayments(long pendingPayments) { this.pendingPayments = pendingPayments; }

    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }

    public BigDecimal getTotalAmountProcessed() { return totalAmountProcessed; }
    public void setTotalAmountProcessed(BigDecimal totalAmountProcessed) { this.totalAmountProcessed = totalAmountProcessed; }
}
