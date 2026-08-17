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

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@Transactional
public class PaymentServiceImpl extends BaseService<PaymentRepository, PaymentResponse, Payment, PaymentMapper, String> implements PaymentService {

    private final PaymentEventPublisher paymentEventPublisher;
    private final VNPAYService vnpayService;
    private final OrderClient orderClient;

    // PaymentRepository và PaymentMapper được tự động tiêm thông qua lớp cha BaseService.
    public PaymentServiceImpl(PaymentEventPublisher paymentEventPublisher,
                              VNPAYService vnpayService,
                              OrderClient orderClient) {
        this.paymentEventPublisher = paymentEventPublisher;
        this.vnpayService = vnpayService;
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
    public String createVNPAYUrl(PaymentRequest request, String ipAddress , Long currentUserId) {
        log.info("Yêu cầu tạo link VNPAY cho đơn hàng: [{}]. Phương thức: {}",
                request.getOrderId(), request.getPaymentMethod());

        Payment payment = repository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> {
                    log.error("Lỗi tạo URL: Không tìm thấy bản ghi Payment cho đơn hàng [{}]", request.getOrderId());
                    return new PaymentNotFoundException("Không tìm thấy thanh toán cho đơn hàng: " + request.getOrderId());
                });
        //Kiểm tra quyền sở hữu đơn hàng trước khi tạo link thanh toán
        if(payment.getUserId() != null && !payment.getUserId().equals(currentUserId)){
            log.error("Cảnh báo bảo mật : User ID [{}] không có quyền thanh toán cho đơn hàng [{}]",currentUserId,request.getOrderId());
            throw new BusinessException(HttpStatus.FORBIDDEN,"Bạn không có quyền thanh toán cho đơn hàng này",null);
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

        String vnpTxnRef = request.getOrderId().substring(0, Math.min(request.getOrderId().length(), 8))
                + System.currentTimeMillis() % 1000;
        payment.setVnpTxnRef(vnpTxnRef);

        String paymentUrl = vnpayService.createPaymentUrl(
                request.getOrderId(), vnpTxnRef, totalPrice.longValue(), "Thanh toan don hang " + request.getOrderId(), ipAddress);

        repository.save(payment);
        log.info("Đã tạo và lưu URL thanh toán thành công cho đơn hàng [{}]. Tổng tiền: {} VND",
                request.getOrderId(), totalPrice);

        return paymentUrl;
    }

    @Override
    public Map<String, String> processVNPAYResult(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        log.info("--- [IPN RECEIVE] Nhận kết quả từ VNPAY cho giao dịch: {} ---", txnRef);

        Map<String, String> result = new HashMap<>();

        if (!vnpayService.verifySignature(params)) {
            log.error("XÁC THỰC THẤT BẠI: Chữ ký VNPAY không khớp cho giao dịch [{}]", txnRef);
            result.put("RspCode", "97");
            result.put("Message", "Fail checksum");
            return result;
        }

        Payment payment = repository.findByVnpTxnRef(txnRef).orElse(null);
        if (payment == null) {
            log.error("LỖI ĐỐI SOÁT: Không tìm thấy bản ghi Payment cho mã VNPAY [{}]", txnRef);
            result.put("RspCode", "01");
            result.put("Message", "Order not found");
            return result;
        }

        boolean isSuccess = vnpayService.isSuccess(params);
        PaymentStatus newStatus = isSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        payment.setStatus(newStatus);
        payment.setTransactionId(params.get("vnp_TransactionNo"));
        repository.save(payment);

        log.info("Cập nhật DB thành công cho đơn hàng [{}]. Trạng thái mới: {}", payment.getOrderId(), newStatus);

        PaymentProcessedEvent event = new PaymentProcessedEvent(
                payment.getOrderId(), newStatus.name(), payment.getTransactionId());

        log.info("Đang gửi thông báo kết quả thanh toán sang RabbitMQ cho Order [{}]...", payment.getOrderId());
        paymentEventPublisher.publishPaymentProcessed(event);

        result.put("RspCode", "00");
        result.put("Message", "Confirm Success");

        log.info("--- [IPN PROCESSED] Hoàn tất xử lý IPN VNPAY cho đơn hàng [{}] ---", payment.getOrderId());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(String orderId , Long currentUserId, String role) {
        log.debug("Truy vấn trạng thái thanh toán cho đơn hàng: {}", orderId);
        Payment payment = repository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy thanh toán cho đơn hàng: " + orderId));
        //Kt quyền : Chỉ ADMIN hoặc chính chủ sở hữu đơn hàng mới được quyền truy cập thông tin
        if(!"ADMIN".equals(role) && payment.getUserId() != null && !payment.getUserId().equals(currentUserId)) {
            log.error("Cảnh báo bảo mật: User ID [{}] không có quyền xem thông tin thanh toán cho đơn hàng [{}]", currentUserId, orderId);
            throw new BusinessException(HttpStatus.FORBIDDEN,"Bạn không có quyền xem thông tin thanh toán này",null);
        }
        return mapper.toDto(payment);
    }
}