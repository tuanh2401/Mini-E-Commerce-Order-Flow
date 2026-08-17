package com.example.product_service.listener;

import com.example.lib.model.dto.OrderCreatedEvent;
import com.example.lib.model.dto.OrderItemEvent;
import com.example.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import com.example.lib.model.dto.OrderCancelledEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final ProductService productService;

    @RabbitListener(queues = "order.created")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 1. Log để biết đã nhận được message
        log.info("--- [MQ RECEIVE] Nhận OrderCreatedEvent cho Order ID: {} ---", event.getOrderId());

        try {
            // 2. Duyệt qua từng item trong event
            for (OrderItemEvent item : event.getItems()) {
                try {
                    log.debug("Bắt đầu xử lý trừ kho cho Product ID: {} (Order: {})",
                            item.getProductId(), event.getOrderId());

                    // 3. Gọi xử lý trừ kho
                    productService.reduceStock(item.getProductId(), item.getQuantity());

                    log.info("Đã trừ kho thành công: Sản phẩm {} | Số lượng {} (Order ID: {})",
                            item.getProductId(), item.getQuantity(), event.getOrderId());

                } catch (Exception e) {
                    // Log lỗi chi tiết cho từng sản phẩm để không làm "đứng" cả luồng xử lý (nếu bạn muốn tiếp tục các item khác)
                    log.error("LỖI KHI TRỪ KHO: Sản phẩm ID [{}] thuộc đơn hàng [{}]. Nguyên nhân: {}",
                            item.getProductId(), event.getOrderId(), e.getMessage());

                    // QUAN TRỌNG: Ném lỗi ra ngoài để RabbitMQ biết mà Re-queue (thử lại) hoặc đưa vào DLQ
                    throw e;
                }
            }
            log.info("--- [MQ FINISHED] Hoàn tất trừ kho cho toàn bộ đơn hàng ID: {} ---", event.getOrderId());

        } catch (Exception e) {
            log.error("TIẾN TRÌNH THẤT BẠI: Không thể hoàn tất trừ kho cho Order ID: {}. Lỗi tổng quát: {}",
                    event.getOrderId(), e.getMessage());
            // Ném lỗi để RabbitMQ xử lý cơ chế retry
            throw e;
        }
    }
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "order.cancelled.product", durable = "true"),
            exchange = @Exchange(name = "order.exchange", type = "topic"),
            key = "order.cancelled"
    ))
    public void handleOrderCancelled(OrderCancelledEvent event) {
        log.info("--- [MQ RECEIVE] Nhận OrderCancelledEvent cho Order ID: {} ---", event.getOrderId());
        try {
            // Duyệt qua từng sản phẩm trong sự kiện hủy đơn và cộng lại kho
            for (OrderItemEvent item : event.getItems()) {
                productService.increaseStock(item.getProductId(), item.getQuantity());
            }
            log.info("--- [MQ FINISHED] Hoàn tất hoàn lại kho cho đơn hàng ID: {} ---", event.getOrderId());
        } catch (Exception e) {
            log.error("LỖI HOÀN KHO: Không thể trả hàng cho đơn [{}]. Lỗi: {}", event.getOrderId(), e.getMessage());
            throw e;
        }
    }
}