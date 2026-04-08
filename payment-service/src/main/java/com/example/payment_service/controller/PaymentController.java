package com.example.payment_service.controller;

import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Frontend gọi để lấy link thanh toán VNPAY
     * POST /api/payment/create
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        // Lấy IP thật của người dùng
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null) ipAddress = httpRequest.getRemoteAddr();

        String paymentUrl = paymentService.createVNPAYUrl(request, ipAddress);

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);
        return ResponseEntity.ok(response);
    }

    /**
     * VNPAY gọi ngầm để thông báo kết quả (đáng tin cậy nhất)
     * GET /api/payment/vnpay-ipn
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIPN(
            @RequestParam Map<String, String> params) {

        log.info("--- [IPN] Nhận kết quả từ VNPAY: {} ---", params);
        Map<String, String> result = paymentService.processVNPAYResult(params);
        return ResponseEntity.ok(result);
    }

    /**
     * Người dùng được VNPAY chuyển hướng về đây sau khi thanh toán xong
     * GET /api/payment/vnpay-callback
     */
    @GetMapping("/vnpay-callback")
    public ResponseEntity<Map<String, String>> vnpayCallback(
            @RequestParam Map<String, String> params) {

        log.info("--- [Callback] Người dùng trả về từ VNPAY ---");
        // callback chỉ dùng để thông báo cho FE, không update DB ở đây
        // DB đã được cập nhật ở IPN
        String responseCode = params.get("vnp_ResponseCode");
        Map<String, String> result = new HashMap<>();
        result.put("status", "00".equals(responseCode) ? "SUCCESS" : "FAILED");
        result.put("orderId", params.get("vnp_TxnRef"));
        return ResponseEntity.ok(result);
    }

    /**
     * Query trạng thái thanh toán của một đơn hàng
     * GET /api/payment/{orderId}
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }
}
