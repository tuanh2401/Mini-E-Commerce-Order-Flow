package com.example.payment_service.service.impl;

import com.example.lib.model.dto.OrderCreatedEvent;
import com.example.lib.model.dto.PaymentProcessedEvent;
import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.BaseService;
import com.example.payment_service.client.OrderClient;
import com.example.payment_service.dto.request.PaymentRequest;
import com.example.payment_service.dto.response.OrderDetailResponse;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.entity.PaymentStatus;
import com.example.payment_service.event.PaymentEventPublisher;
import com.example.payment_service.exception.PaymentNotFoundException;
import com.example.payment_service.mapper.PaymentMapper;
import com.example.payment_service.repository.PaymentRepository;
import com.example.payment_service.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;

@Service
@Slf4j
@Transactional
public class PaymentServiceImpl extends BaseService<PaymentRepository, PaymentResponse, Payment, PaymentMapper, String> implements PaymentService {

    private final PaymentEventPublisher paymentEventPublisher;
    private final PayOSService payOSService;
    private final OrderClient orderClient;

    public PaymentServiceImpl(PaymentEventPublisher paymentEventPublisher,
                              PayOSService payOSService,
                              OrderClient orderClient) {
        this.paymentEventPublisher = paymentEventPublisher;
        this.payOSService = payOSService;
        this.orderClient = orderClient;
    }

    @Override
    public void createPaymentFromEvent(OrderCreatedEvent event) {
        log.info("--- [EVENT RECEIVE] Nhận yêu cầu khởi tạo Payment cho Order ID: {} ---", event.getOrderId());

        if (repository.findByOrderId(event.getOrderId()).isPresent()) {
            log.warn("Bỏ qua khởi tạo: Payment đã tồn tại cho đơn hàng [{}]", event.getOrderId());
            return;
        }

        Payment payment = new Payment();
        payment.setOrderId(event.getOrderId());
        payment.setUserId(event.getUserId());
        payment.setAmount(BigDecimal.ZERO);
        payment.setStatus(PaymentStatus.PENDING);

        repository.save(payment);
        log.info("Khởi tạo Payment trạng thái PENDING thành công cho đơn hàng [{}]", event.getOrderId());
    }

    @Override
    public String createPayOSUrl(PaymentRequest request, String ipAddress, Long currentUserId) {
        log.info("Yêu cầu tạo link PayOS cho đơn hàng: [{}]. Phương thức: {}",
                request.getOrderId(), request.getPaymentMethod());

        Payment payment = repository.findByOrderId(request.getOrderId())
                .orElseGet(() -> {
                    log.info("Chưa tìm thấy Payment từ RabbitMQ event, tự động khởi tạo Payment PENDING cho đơn hàng [{}]", request.getOrderId());
                    Payment p = new Payment();
                    p.setOrderId(request.getOrderId());
                    p.setUserId(currentUserId);
                    p.setAmount(BigDecimal.ZERO);
                    p.setStatus(PaymentStatus.PENDING);
                    return repository.save(p);
                });

        // Kiểm tra quyền sở hữu đơn hàng
        if (payment.getUserId() != null && !payment.getUserId().equals(currentUserId)) {
            log.error("Cảnh báo bảo mật: User ID [{}] không có quyền thanh toán cho đơn hàng [{}]", currentUserId, request.getOrderId());
            throw new BusinessException(HttpStatus.FORBIDDEN, "Bạn không có quyền thanh toán cho đơn hàng này", null);
        }

        log.debug("Đang gọi Order-Service để lấy tổng tiền đơn hàng [{}]...", request.getOrderId());
        BaseResponse<OrderDetailResponse> orderResWrapper = orderClient.getOrderById(request.getOrderId());
        OrderDetailResponse orderRes = (orderResWrapper != null) ? orderResWrapper.getData() : null;

        if (orderRes == null || orderRes.getTotalPrice() == null) {
            log.error("Lỗi Feign: Order-Service không trả về thông tin tiền cho đơn hàng [{}]", request.getOrderId());
            throw new PaymentNotFoundException("Không lấy được thông tin đơn hàng: " + request.getOrderId());
        }

        BigDecimal totalPrice = orderRes.getTotalPrice();
        payment.setAmount(totalPrice);
        payment.setPaymentMethod(request.getPaymentMethod());

        // Sinh orderCode dạng số nguyên dương duy nhất (Long)
        long orderCode = System.currentTimeMillis() % 1_000_000_000L;
        payment.setOrderCode(orderCode);

        String description = "DH" + orderCode;
        String paymentUrl = payOSService.createPaymentLink(orderCode, totalPrice.longValue(), description);

        repository.save(payment);
        log.info("Đã tạo và lưu URL thanh toán PayOS thành công cho đơn hàng [{}]. Tổng tiền: {} VND, OrderCode: {}",
                request.getOrderId(), totalPrice, orderCode);

        return paymentUrl;
    }

    @Override
    public void processPayOSWebhook(Webhook webhookBody) {
        // 1. Xác thực Webhook với PayOS
        WebhookData webhookData = payOSService.verifyWebhook(webhookBody);
        Long orderCode = webhookData.getOrderCode();

        log.info("--- [PAYOS WEBHOOK] Nhận kết quả thanh toán cho OrderCode: {} ---", orderCode);

        // 2. Tìm payment theo orderCode (Nếu là request test webhook từ PayOS thì chỉ log và bỏ qua)
        Payment payment = repository.findByOrderCode(orderCode).orElse(null);
        if (payment == null) {
            log.warn("Không tìm thấy đơn hàng trong DB cho OrderCode: {} (Có thể là request kiểm tra Webhook URL từ PayOS)", orderCode);
            return;
        }

        // 3. Kiểm tra trạng thái giao dịch
        boolean isSuccess = "00".equals(webhookBody.getCode()) || "00".equals(webhookData.getCode());
        PaymentStatus newStatus = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        payment.setStatus(newStatus);
        payment.setTransactionId(webhookData.getReference());
        repository.save(payment);

        log.info("Cập nhật DB thành công cho đơn hàng [{}]. Trạng thái mới: {}", payment.getOrderId(), newStatus);

        // 4. Bắn RabbitMQ event cập nhật Order Service
        PaymentProcessedEvent event = new PaymentProcessedEvent(
                payment.getOrderId(), newStatus.name(), payment.getTransactionId());

        log.info("Đang gửi thông báo kết quả thanh toán sang RabbitMQ cho Order [{}]...", payment.getOrderId());
        paymentEventPublisher.publishPaymentProcessed(event);

        log.info("--- [PAYOS WEBHOOK PROCESSED] Hoàn tất xử lý webhook cho đơn hàng [{}] ---", payment.getOrderId());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(String orderId, Long currentUserId, String role) {
        log.debug("Truy vấn trạng thái thanh toán cho đơn hàng: {}", orderId);
        Payment payment = repository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy thanh toán cho đơn hàng: " + orderId));

        if (!"ADMIN".equals(role) && payment.getUserId() != null && !payment.getUserId().equals(currentUserId)) {
            log.error("Cảnh báo bảo mật: User ID [{}] không có quyền xem thông tin thanh toán cho đơn hàng [{}]", currentUserId, orderId);
            throw new BusinessException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thông tin thanh toán này", null);
        }
        return mapper.toDto(payment);
    }
}