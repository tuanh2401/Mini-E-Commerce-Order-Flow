package com.example.payment_service.service.impl;

import com.example.lib.dto.OrderCreatedEvent;
import com.example.lib.dto.PaymentProcessedEvent;
import com.example.payment_service.client.OrderClient;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.OrderDetailResponse;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.entity.PaymentStatus;
import com.example.payment_service.event.PaymentEventPublisher;
import com.example.payment_service.exception.PaymentNotFoundException;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;
    private final VNPAYService vnpayService;
    private final OrderClient orderClient;  // Feign Client gọi sang order-service

    // ====================================================
    // ① Được gọi bởi OrderCreatedConsumer (RabbitMQ)
    //    Tạo bản ghi Payment với status PENDING khi đơn hàng mới được tạo
    // ====================================================
    @Override
    public void createPaymentFromEvent(OrderCreatedEvent event) {
        log.info("Tạo Payment PENDING cho orderId={}", event.getOrderId());

        // Kiểm tra nếu payment cho order này đã tồn tại thì bỏ qua (tránh duplicate)
        if (paymentRepository.findByOrderId(event.getOrderId()).isPresent()) {
            log.warn("Payment đã tồn tại cho orderId={}, bỏ qua.", event.getOrderId());
            return;
        }

        Payment payment = new Payment();
        payment.setOrderId(event.getOrderId());
        payment.setUserId(event.getUserId());
        // Tổng tiền: tạm để 0, sẽ được cập nhật khi Frontend gọi tạo URL thanh toán
        // vì OrderCreatedEvent hiện tại chưa có trường totalPrice
        payment.setAmount(BigDecimal.ZERO);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());

        paymentRepository.save(payment);
        log.info("Đã lưu Payment PENDING thành công cho orderId={}", event.getOrderId());
    }

    // ====================================================
    // ② Được gọi bởi PaymentController
    //    Tạo URL thanh toán VNPAY và trả về cho Frontend
    // ====================================================
    @Override
    public String createVNPAYUrl(PaymentRequest request, String ipAddress) {
        // Tìm Payment đã được tạo sẵn bởi event
        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new PaymentNotFoundException(
                        "Không tìm thấy thanh toán cho đơn hàng: " + request.getOrderId()));

        // Gọi Feign sang order-service để lấy totalPrice chính xác
        OrderDetailResponse orderRes = orderClient.getOrderById(request.getOrderId());
        if (orderRes == null || orderRes.getTotalPrice() == null) {
            throw new PaymentNotFoundException("Không lấy được thông tin đơn hàng hoặc tổng tiền: " + request.getOrderId());
        }
        BigDecimal totalPrice = orderRes.getTotalPrice();
        payment.setAmount(totalPrice);

        long amount = totalPrice.longValue();

        String orderInfo = "Thanh toan don hang " + request.getOrderId();
        String paymentUrl = vnpayService.createPaymentUrl(
                request.getOrderId(), amount, orderInfo, ipAddress);

        // Lưu phương thức thanh toán vào DB
        payment.setPaymentMethod(request.getPaymentMethod());
        paymentRepository.save(payment);

        log.info("Đã tạo URL thanh toán VNPAY cho orderId={}", request.getOrderId());
        return paymentUrl;
    }

    // ====================================================
    // ③ Được gọi bởi PaymentController khi VNPAY gửi IPN
    //    Xác thực chữ ký → cập nhật DB → bắn RabbitMQ
    // ====================================================
    @Override
    public Map<String, String> processVNPAYResult(Map<String, String> params) {
        Map<String, String> result = new HashMap<>();

        // Bước 1: Xác thực chữ ký VNPAY (bắt buộc, tránh bị giả mạo)
        boolean isValid = vnpayService.verifySignature(params);
        if (!isValid) {
            log.error("Chữ ký VNPAY không hợp lệ! Có thể bị giả mạo.");
            result.put("RspCode", "97");  // Mã lỗi VNPAY: Checksum failed
            result.put("Message", "Fail checksum");
            return result;
        }

        // Bước 2: Lấy thông tin từ params VNPAY trả về
        String vnpTxnRef    = params.get("vnp_TxnRef");
        String vnpTransactionId = params.get("vnp_TransactionNo");
        boolean isSuccess   = vnpayService.isSuccess(params);

        // Bước 3: Tìm Payment theo mã tham chiếu giao dịch (vnpTxnRef)
        // vnpTxnRef là mã ngắn (8 ký tự đầu orderId + timestamp), nên ta cần tìm khớp
        Payment payment = paymentRepository.findByVnpTxnRef(vnpTxnRef)
                .orElse(null);

        if (payment == null) {
            log.error("Không tìm thấy Payment theo vnpTxnRef={}", vnpTxnRef);
            result.put("RspCode", "01");
            result.put("Message", "Order not found");
            return result;
        }

        // Bước 4: Cập nhật trạng thái Payment trong DB
        PaymentStatus newStatus = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
        payment.setStatus(newStatus);
        payment.setTransactionId(vnpTransactionId);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        log.info("Đã cập nhật Payment orderId={} → status={}", payment.getOrderId(), newStatus);

        // Bước 5: Bắn event RabbitMQ thông báo cho order-service
        PaymentProcessedEvent event = new PaymentProcessedEvent(
                payment.getOrderId(),
                newStatus.name(),
                vnpTransactionId
        );
        paymentEventPublisher.publishPaymentProcessed(event);

        // Bước 6: Trả về phản hồi chuẩn cho VNPAY (VNPAY yêu cầu code "00" = OK)
        result.put("RspCode", "00");
        result.put("Message", "Confirm Success");
        return result;
    }

    // ====================================================
    // ④ Được gọi bởi PaymentController để query trạng thái
    // ====================================================
    @Override
    public PaymentResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(
                        "Không tìm thấy thanh toán cho đơn hàng: " + orderId));

        return mapToResponse(payment);
    }

    // ====================================================
    // Helper: map entity → DTO
    // ====================================================
    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse res = new PaymentResponse();
        res.setId(payment.getId());
        res.setOrderId(payment.getOrderId());
        res.setAmount(payment.getAmount());
        res.setStatus(payment.getStatus().name());
        res.setPaymentMethod(payment.getPaymentMethod());
        res.setTransactionId(payment.getTransactionId());
        res.setCreatedAt(payment.getCreatedAt());
        return res;
    }
}
