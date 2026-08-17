package com.example.dashboard.service;

import com.example.dashboard.client.*;
import com.example.dashboard.dto.response.DashboardSummaryResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class DashboardService {

    private final OrderClient orderClient;
//    private final ProductClient productClient;
    private final UserClient userClient;
    private final PaymentClient paymentClient;
    private final PromotionClient promotionClient;

    public DashboardService(OrderClient orderClient, UserClient userClient, PaymentClient paymentClient, PromotionClient promotionClient) {
        this.orderClient = orderClient;
//        this.productClient = productClient;
        this.userClient = userClient;
        this.paymentClient = paymentClient;
        this.promotionClient = promotionClient;
    }

    // Danh sách lưu trữ các Client đang kết nối xem Dashboard Realtime
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // 1. Hàm tổng hợp data từ 5 service
    public DashboardSummaryResponse getAggregatedSummary() {
        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setOrderAnalytics(orderClient.getSummary().getData());
//        response.setProductAnalytics(productClient.getSummary().getData());
        response.setUserAnalytics(userClient.getSummary().getData());
        response.setPaymentAnalytics(paymentClient.getSummary().getData());
        response.setPromotionAnalytics(promotionClient.getSummary().getData());
        return response;
    }

    // 2. Hàm đăng ký SSE Client (Frontend kết nối vào đây)
    public SseEmitter subscribe() {
        // Timeout 30 phút. Hết 30p frontend sẽ tự auto-reconnect
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        // Bắn ngay data lần đầu tiên cho Frontend khi vừa kết nối
        try {
            emitter.send(SseEmitter.event().name("INIT").data(getAggregatedSummary()));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    // 3. Hàm bắn luồng dữ liệu mới (Sẽ được gọi bởi RabbitMQ Listener sau này)
    public void pushRealtimeUpdate() {
        DashboardSummaryResponse newData = getAggregatedSummary();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("UPDATE").data(newData));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}