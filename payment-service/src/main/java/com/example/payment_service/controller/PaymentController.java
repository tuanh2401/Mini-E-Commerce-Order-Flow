package com.example.payment_service.controller;

import com.example.lib.controller.BaseController;
import com.example.lib.model.dto.PaymentProcessedEvent;
import com.example.lib.model.response.BaseResponse;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.PaymentCreateResponse;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.event.PaymentEventPublisher;
import com.example.payment_service.service.PaymentService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.payos.model.webhooks.Webhook;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController extends BaseController<PaymentService, PaymentResponse, String> {
    @Autowired
    private PaymentEventPublisher paymentEventPublisher;

    /**
     * Frontend gọi để lấy link thanh toán PayOS.
     * URL: POST /api/payments/create
     */
    @PostMapping("/create")
    @PreAuthorize("@ss.hasPermission('PAYMENT_CREATE')")
    public ResponseEntity<BaseResponse<PaymentCreateResponse>> createPayment(
            @Parameter(hidden = true) @RequestHeader("userId") Long currentUserId,
            @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null) ipAddress = httpRequest.getRemoteAddr();

        String paymentUrl = service.createPayOSUrl(request, ipAddress, currentUserId);
        PaymentCreateResponse paymentResponse = PaymentCreateResponse.builder()
                .paymentUrl(paymentUrl)
                .build();

        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, paymentResponse));
    }

    /**
     * PayOS gọi Webhook (POST) thông báo kết quả thanh toán.
     * URL: POST /api/payments/payos-webhook
     */
    @PostMapping("/payos-webhook")
    public ResponseEntity<Map<String, Object>> payosWebhook(@RequestBody Webhook webhookBody) {
        log.info("--- [PAYOS WEBHOOK RECEIVED] Nhận webhook từ PayOS: {} ---", webhookBody);
        Map<String, Object> response = new HashMap<>();
        try {
            service.processPayOSWebhook(webhookBody);
            response.put("error", 0);
            response.put("message", "Webhook delivered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý PayOS Webhook: {}", e.getMessage());
            response.put("error", -1);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Người dùng được PayOS chuyển hướng về sau khi thanh toán xong.
     * URL: GET /api/payments/payos-callback
     */
    @GetMapping("/payos-callback")
    public ResponseEntity<Map<String, String>> payosCallback(@RequestParam Map<String, String> params) {
        log.info("--- [PayOS Callback] Người dùng trả về từ PayOS: {} ---", params);
        Map<String, String> result = new HashMap<>(params);
        result.put("status", "PAID".equalsIgnoreCase(params.get("status")) || "00".equals(params.get("code")) ? "SUCCESS" : "FAILED");
        return ResponseEntity.ok(result);
    }

    /**
     * Người dùng bấm hủy thanh toán trên trang PayOS.
     * URL: GET /api/payments/payos-cancel
     */
    @GetMapping("/payos-cancel")
    public ResponseEntity<Map<String, String>> payosCancel(@RequestParam Map<String, String> params) {
        log.info("--- [PayOS Cancel] Người dùng hủy thanh toán PayOS: {} ---", params);
        Map<String, String> result = new HashMap<>(params);
        result.put("status", "CANCELLED");
        return ResponseEntity.ok(result);
    }

    /**
     * Query trạng thái thanh toán của một đơn hàng.
     * URL: GET /api/payments/{orderId}
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("@ss.hasPermission('PAYMENT_VIEW')")
    public ResponseEntity<BaseResponse<PaymentResponse>> getPaymentStatus(
            @PathVariable("orderId") String orderId,
            @RequestHeader("userId") Long currentUserId,
            @RequestHeader("X-User-Role") String role) {
        PaymentResponse paymentResponse = service.getPaymentByOrderId(orderId, currentUserId, role);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, paymentResponse));
    }
    @GetMapping("/test-kafka")
    public ResponseEntity<String> testKafka(@RequestParam(defaultValue = "1001") String orderId) {
        PaymentProcessedEvent event = new PaymentProcessedEvent(orderId, "SUCCESS", "TXN_TEST_KAFKA_888");
        paymentEventPublisher.publishPaymentProcessed(event);
        return ResponseEntity.ok("✅ Đã bắn sự kiện Kafka thành công cho đơn hàng: " + orderId);
    }
}