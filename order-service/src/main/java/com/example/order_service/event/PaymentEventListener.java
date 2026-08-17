package com.example.order_service.event;

import com.example.lib.model.dto.OrderPaidEvent;
import com.example.lib.model.dto.PaymentProcessedEvent;
import com.example.order_service.entity.Order;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Component
public class PaymentEventListener {
    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;
    //Viết phương thức và xử lý tin nhắn
    @RabbitListener(queues = "payment.order.queue")
    public void handlePaymentProcessed(PaymentProcessedEvent paymentProcessedEvent) {
        //Log ngay khi nhận được tin nhắn
        log.info("---- [MQ RECIEVE] nhận event thanh toán từ Payment-Service cho OrderID: {} ------", paymentProcessedEvent.getOrderId());
        try {
            //Tìm đơn hàng trong database
            Optional<Order> orderOptional = orderRepository.findById(paymentProcessedEvent.getOrderId());
            if (orderOptional.isEmpty()){
                //log warn nếu k tìm thấy đơn hàng
                log.warn("Không tìm thấy đơn hàng ID: {}", paymentProcessedEvent.getOrderId());
                return;
            }
            Order order = orderOptional.get();
            String oldStatus =  order.getStatus();
            String newStatus;
            //Dựa vào status trong event để quyết định trạng thái
            if("SUCCESS".equalsIgnoreCase(paymentProcessedEvent.getStatus())){
                newStatus = "PAID";
                log.info("Thanh toán thành công cho đơn hàng : {}. Chuyển trạng thái sang paid",paymentProcessedEvent.getOrderId());

            }else {
                newStatus = "CANCELLED";
                log.info("Thanh toán thất bại cho đơn hàng: {}. Chuyển trạng thái sang Cancelled",paymentProcessedEvent.getOrderId());
            }
            OrderPaidEvent orderPaidEvent = new OrderPaidEvent(
                    order.getId(),
                    order.getUserId(),
                    order.getTotalPrice()
            );
            //Gửi event lên rabbitmq
            rabbitTemplate.convertAndSend("order.exchange", "order.paid" , orderPaidEvent);
            log.info("---- [MQ SEND] ---- Đã gửi sự kiện OrderPaidEvent cho OrderID: {} ------ ", order.getId());

            //Cập nhật trạng thái và lưu vào database
            order.setStatus(newStatus);
            orderRepository.save(order);
            //Log kết quả thành công
            log.info("Cập nhật thành công trạng thái đơn hàng [{}] từ [{}] thành [{}] thành công",paymentProcessedEvent.getOrderId(),oldStatus,newStatus);

        }catch (Exception e){
            //Xử lý ngoại lệ và log chi tiết
            log.error("Lỗi nghiêm trọng : Không thể cập nhật trạng thái cho đơn hàng ID: {}. Chi tiết lỗi: {}",paymentProcessedEvent.getOrderId(),e.getMessage());
        }

    }
}
