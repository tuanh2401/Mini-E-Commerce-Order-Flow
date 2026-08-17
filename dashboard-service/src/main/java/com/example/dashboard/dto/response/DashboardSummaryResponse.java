package com.example.dashboard.dto.response;

public class DashboardSummaryResponse {
    private OrderAnalyticsResponse orderAnalytics;
    private ProductAnalyticsResponse productAnalytics;
    private UserAnalyticsResponse userAnalytics;
    private PaymentAnalyticsResponse paymentAnalytics;
    private PromotionAnalyticsResponse promotionAnalytics;

    public DashboardSummaryResponse() {
    }

    public OrderAnalyticsResponse getOrderAnalytics() {
        return orderAnalytics;
    }

    public void setOrderAnalytics(OrderAnalyticsResponse orderAnalytics) {
        this.orderAnalytics = orderAnalytics;
    }

    public ProductAnalyticsResponse getProductAnalytics() {
        return productAnalytics;
    }

    public void setProductAnalytics(ProductAnalyticsResponse productAnalytics) {
        this.productAnalytics = productAnalytics;
    }

    public UserAnalyticsResponse getUserAnalytics() {
        return userAnalytics;
    }

    public void setUserAnalytics(UserAnalyticsResponse userAnalytics) {
        this.userAnalytics = userAnalytics;
    }

    public PaymentAnalyticsResponse getPaymentAnalytics() {
        return paymentAnalytics;
    }

    public void setPaymentAnalytics(PaymentAnalyticsResponse paymentAnalytics) {
        this.paymentAnalytics = paymentAnalytics;
    }

    public PromotionAnalyticsResponse getPromotionAnalytics() {
        return promotionAnalytics;
    }

    public void setPromotionAnalytics(PromotionAnalyticsResponse promotionAnalytics) {
        this.promotionAnalytics = promotionAnalytics;
    }
}