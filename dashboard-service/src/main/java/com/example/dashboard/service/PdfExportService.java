package com.example.dashboard.service;

import com.example.dashboard.dto.response.DashboardSummaryResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfExportService {

    private final DashboardService dashboardService;

    public PdfExportService(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    public byte[] exportDashboardSummaryToPdf() {
        // 1. Khởi tạo luồng bộ nhớ ảo
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // 2. Lấy dữ liệu báo cáo mới nhất
        DashboardSummaryResponse data = dashboardService.getAggregatedSummary();

        // 3. Mở tờ giấy ảo (Document)
        Document document = new Document();
        PdfWriter.getInstance(document, out);
        document.open();

        // 4. Định dạng chữ (Font) - Tạm dùng Font cơ bản tiếng Anh trước
        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Font normalFont = new Font(Font.HELVETICA, 12, Font.NORMAL);

        // 5. Bắt đầu "Viết" lên giấy
        // Gợi ý: Dùng document.add(new Paragraph("Nội dung", font));
        document.add(new Paragraph("DASHBOARD SYSTEM REPORT", titleFont));
        document.add(new Paragraph(" ", normalFont)); // Dòng trống

        // Gợi ý: Vẽ số liệu Order
        document.add(new Paragraph("1. ORDER ANALYTICS", titleFont));
        document.add(new Paragraph("Total Orders: " + data.getOrderAnalytics().getTotalOrders(), normalFont));
        document.add(new Paragraph("Total Revenue: $" + data.getOrderAnalytics().getTotalRevenue(), normalFont));

        // 2. PRODUCT ANALYTICS
        document.add(new Paragraph(" ", normalFont));
        document.add(new Paragraph("2. PRODUCT ANALYTICS", titleFont));
        document.add(new Paragraph("Total Products: " + data.getProductAnalytics().getTotalProducts(), normalFont));
        document.add(new Paragraph("Total Categories: " + data.getProductAnalytics().getTotalCategories(), normalFont));
        document.add(new Paragraph("Out of Stock: " + data.getProductAnalytics().getOutOfStockCount(), normalFont));
        document.add(new Paragraph("Low Stock: " + data.getProductAnalytics().getLowStockCount(), normalFont));
        document.add(new Paragraph("Average Rating: " + data.getProductAnalytics().getAverageRating() + " stars", normalFont));

        // 3. USER ANALYTICS
        document.add(new Paragraph(" ", normalFont));
        document.add(new Paragraph("3. USER ANALYTICS", titleFont));
        document.add(new Paragraph("Total Users: " + data.getUserAnalytics().getTotalUser(), normalFont));
        document.add(new Paragraph("Total Spent: $" + data.getUserAnalytics().getTotalRevenueFromUsers(), normalFont));
        if (data.getUserAnalytics().getMembershipDistribution() != null) {
            document.add(new Paragraph("Membership: " + data.getUserAnalytics().getMembershipDistribution().toString(), normalFont));
        }

        // 4. PAYMENT ANALYTICS
        document.add(new Paragraph(" ", normalFont));
        document.add(new Paragraph("4. PAYMENT ANALYTICS", titleFont));
        document.add(new Paragraph("Total Transactions: " + data.getPaymentAnalytics().getTotalPayments(), normalFont));
        document.add(new Paragraph("Successful Transactions: " + data.getPaymentAnalytics().getSuccessfulPayments(), normalFont));
        document.add(new Paragraph("Failed Transactions: " + data.getPaymentAnalytics().getFailedPayments(), normalFont));
        document.add(new Paragraph("Success Rate: " + data.getPaymentAnalytics().getSuccessRate() + "%", normalFont));
        document.add(new Paragraph("Total Paid Amount: $" + data.getPaymentAnalytics().getTotalAmountProcessed(), normalFont));

        // 5. PROMOTION ANALYTICS
        document.add(new Paragraph(" ", normalFont));
        document.add(new Paragraph("5. PROMOTION ANALYTICS", titleFont));
        document.add(new Paragraph("Total Vouchers: " + data.getPromotionAnalytics().getTotalVouchers(), normalFont));
        document.add(new Paragraph("Active Vouchers: " + data.getPromotionAnalytics().getActiveVouchers(), normalFont));
        document.add(new Paragraph("Total Usage: " + data.getPromotionAnalytics().getTotalUsageCount(), normalFont));
        document.add(new Paragraph("Average Usage Rate: " + data.getPromotionAnalytics().getAvgUsageRate(), normalFont));

        // 6. Đóng giấy lại
        document.close();

        // Trả về mảng byte của file
        return out.toByteArray();
    }
}