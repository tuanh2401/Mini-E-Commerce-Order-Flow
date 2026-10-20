package com.example.user_service.event;

import com.example.lib.model.dto.OrderPaidEvent;
import com.example.user_service.service.MembershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderPaidEventListener {
    private final MembershipService membershipService;
//    @RabbitListener(queues = "${rabbitmq.queue.order-paid}")
//    public void orderPaid(OrderPaidEvent orderPaidEvent) {
//        log.info("---- [MQ RECIEVE] ---- nhận sự kiện thanh toán thành công của đơn hàng ID: {} cho User ID: {}", orderPaidEvent.getOrderId(), orderPaidEvent.getUserId());
//        try {
//            membershipService.updateMembership(orderPaidEvent.getUserId(), orderPaidEvent.getAmount());
//        } catch (Exception e) {
//            log.error("Lỗi khi xử lý tích lũy hội viên cho User ID : [{}] . Chi tiết {}",orderPaidEvent.getUserId(), e.getMessage());
//        }
//    }
    //Lắng nghe từ kafka topic
    @KafkaListener(topics = "order-paid-topic",groupId = "user-tier-group")
    public void handleOrderPaidKafka(OrderPaidEvent event){
        log.info("[Kafka Consumer - User Service] Nhận sự kiện thanh toán thành công cho OrderId: {},UserId: {}, Số tiền: {}",event.getOrderId(),event.getUserId(),event.getAmount());
        try{
            if(event.getUserId() != null && event.getAmount() != null){
                membershipService.updateMembership(event.getUserId(), event.getAmount());
                log.info("[Membership] Đã cập nhật chi tiêu và xét thăng hạng cho UserId: {}",event.getUserId());
            }else{
                log.warn("UserId hoặc Amount rỗng , bỏ qua tính điểm hội viên");
            }
        }catch (Exception e){
            log.error("Lỗi xử lý tích lũy điểm hội viên cho UserId [{}]: {}",event.getUserId(),e.getMessage());
        }
    }
}
