package com.example.dashboard.controller;

import com.example.dashboard.dto.response.DashboardSummaryResponse;
import com.example.lib.model.response.BaseResponse;
import com.example.dashboard.service.DashboardService;
import com.example.dashboard.service.PdfExportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final PdfExportService pdfExportService;

    public DashboardController(DashboardService dashboardService, PdfExportService pdfExportService) {
        this.dashboardService = dashboardService;
        this.pdfExportService = pdfExportService;
    }

    /**
     * API lấy dữ liệu tổng hợp Dashboard (Admin).
     * URL: GET /api/dashboard/summary
     */
    @GetMapping("/summary")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<BaseResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse data = dashboardService.getAggregatedSummary();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    /**
     * API Stream Realtime bằng SSE (Frontend mở kết nối liên tục).
     * URL: GET /api/dashboard/stream
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDashboard() {
        return dashboardService.subscribe();
    }

    /**
     * Xuất báo cáo tổng quan Dashboard sang file PDF (Admin).
     * URL: GET /api/dashboard/export-pdf
     */
    @GetMapping("/export-pdf")
    @PreAuthorize("@ss.hasPermission('ANALYTICS_VIEW')")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] pdfBytes = pdfExportService.exportDashboardSummaryToPdf();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "dashboard_report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}