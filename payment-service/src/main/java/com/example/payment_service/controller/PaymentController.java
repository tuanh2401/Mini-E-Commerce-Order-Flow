package com.example.payment_service.controller;

import com.example.lib.controller.BaseController;
import com.example.lib.model.response.BaseResponse;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.PaymentCreateResponse;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.service.PaymentService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController extends BaseController<PaymentService, PaymentResponse, String> {

    /**
     * Frontend gọi để lấy link thanh toán VNPAY.
     * URL: POST /api/payments/create
     */
    @PostMapping("/create")
    @PreAuthorize("@ss.hasPermission('PAYMENT_CREATE')")
    public ResponseEntity<BaseResponse<PaymentCreateResponse>> createPayment(@Parameter(hidden = true) @RequestHeader("userId") Long currentUserId,
            @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null) ipAddress = httpRequest.getRemoteAddr();

        String paymentUrl = service.createVNPAYUrl(request, ipAddress, currentUserId);
        PaymentCreateResponse paymentResponse = PaymentCreateResponse.builder()
                .paymentUrl(paymentUrl)
                .build();

        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, paymentResponse));
    }

    /**
     * VNPAY gọi ngầm (IPN) để thông báo kết quả.
     * Lưu ý: Endpoint này bắt buộc trả về Map<String, String> thô theo đúng chuẩn giao thức của VNPAY.
     * URL: GET /api/payments/vnpay-ipn
     */
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayIPN(@RequestParam Map<String, String> params) {
        log.info("--- [IPN] Nhận kết quả từ VNPAY: {} ---", params);
        Map<String, String> result = service.processVNPAYResult(params);
        return ResponseEntity.ok(result);
    }

    /**
     * Người dùng được VNPAY chuyển hướng về đây sau khi thanh toán xong.
     * URL: GET /api/payments/vnpay-callback
     */
    @GetMapping("/vnpay-callback")
    public ResponseEntity<Map<String, String>> vnpayCallback(@RequestParam Map<String, String> params) {
        log.info("--- [Callback] Người dùng trả về từ VNPAY ---");
        String responseCode = params.get("vnp_ResponseCode");
        Map<String, String> result = new HashMap<>();
        result.put("status", "00".equals(responseCode) ? "SUCCESS" : "FAILED");
        result.put("orderId", params.get("vnp_TxnRef"));
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
            @RequestHeader("X-User-Role")  String role) {
        PaymentResponse paymentResponse = service.getPaymentByOrderId(orderId, currentUserId, role);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, paymentResponse));
    }
}