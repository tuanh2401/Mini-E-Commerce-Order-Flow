package com.example.product_service.listener;

import com.example.lib.dto.OrderCreatedEvent;
import com.example.lib.dto.OrderItemEvent;
import com.example.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Slf4j
@Component
@Service
@RequiredArgsConstructor
public class OrderEventListener {
    private final ProductService productService;
    @RabbitListener(queues = "order.created")
    public void handleOrderCreated(OrderCreatedEvent event) {
        //1.Log để biết đã nhận được message
        log.info("Nhận được OrderCreatedEvent cho orderId = {}", event.getOrderId());
        //2.Duyệt qua từng item trong event
        for(OrderItemEvent item : event.getItems()) {
            // 3. Gọi productService.reduceStock với đúng 2 tham số:
            //    - item.getProductId()  → id sản phẩm cần trừ
            //    - item.getQuantity()   → số lượng cần trừ
            productService.reduceStock(item.getProductId(), item.getQuantity());
            log.info("Đã trừ kho sản phẩm {} số lượng {}", item.getProductId(), item.getQuantity());
        }
    }
}
