package com.example.listener;

import com.example.lib.model.dto.OrderCancelledEvent;
import com.example.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderCancelledListener {

    private final VoucherService voucherService;

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "order.cancelled.promotion", durable = "true"),
            exchange = @Exchange(name = "order.exchange", type = "topic"),
            key = "order.cancelled"
    ))
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("--- [MQ RECEIVE] Nhận OrderCancelledEvent cho Order ID: {} ---", event.getOrderId());

        // Nếu đơn hàng có sử dụng voucher, tiến hành hoàn lại voucher
        if (event.getVoucherCode() != null && !event.getVoucherCode().trim().isEmpty()) {
            try {
                voucherService.release(event.getVoucherCode());
                log.info("--- [MQ FINISHED] Hoàn tất nhả voucher [{}] cho đơn hàng ID: {} ---",
                        event.getVoucherCode(), event.getOrderId());
            } catch (Exception e) {
                log.error("LỖI HOÀN VOUCHER: Không thể trả lại voucher [{}] cho đơn [{}]. Lỗi: {}",
                        event.getVoucherCode(), event.getOrderId(), e.getMessage());
                throw e;
            }
        }
    }
}