package com.example.order_service.service.impl;

import com.example.order_service.client.ProductClient;
import com.example.order_service.client.UserClient;
import com.example.order_service.dto.request.OrderItemRequest;
import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.response.OrderItemResponse;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.lib.dto.ApiResponse; // Import từ thư viện dùng chung
import com.example.order_service.dto.response.ProductResponse; // Import DTO của chính nó
import com.example.order_service.dto.response.ProductResponse; // Import DTO của chính nó

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.bouncycastle.asn1.x500.style.RFC4519Style.o;

@Service // spring boot phân biệt là service bean
@RequiredArgsConstructor // Tự tạo constructor nhúng các repository vào
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final UserClient userClient;
    @Override
    @Transactional // Nếu ở giữa chừng xảy ra lỗi vd sever sập thì fb sẽ rollback
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        // Khởi tạo hóa đơn mới
        Order order = new Order();
        order.setUserId(userId);
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        
        String userName = "Người dùng ẩn danh";
        try {
            // Gọi sang user-service để xác thực người dùng
            var userProfile = userClient.getUserById(userId);
            if (userProfile == null) {
                throw new RuntimeException("Không tìm thấy thông tin người dùng!");
            }
            userName = userProfile.getFullName();
            System.out.println("Xác thực thành công khách hàng: " + userProfile.getFullName());
        } catch (Exception e) {
            // Nếu có lỗi (404 từ user-service hoặc lỗi mạng), ném lỗi để Rollback Transaction
            throw new RuntimeException("Lỗi xác thực người dùng: " + e.getMessage());
        }
        // Tính toán tiền và tạo ra các món hàng
        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }

        for (OrderItemRequest reqItem : request.getOrderItems()) {
            // a. Gọi sang product-service để lấy thông tin sản phẩm "xịn"
            ApiResponse<ProductResponse> productRes = productClient.getProductById(reqItem.getProductId());

            if (productRes == null || productRes.getData() == null) {
                throw new RuntimeException("Sản phẩm " + reqItem.getProductId() + " không tồn tại!");
            }

            ProductResponse productInfo = productRes.getData();

            // b. Kiểm tra và Trừ kho NGAY LẬP TỨC sang product-service
            // Nếu kho không đủ, service bên kia sẽ ném lỗi và transaction ở đây sẽ rollback
            productClient.reduceStock(reqItem.getProductId(), reqItem.getQuantity());

            OrderItem item = new OrderItem();
            item.setProductId(reqItem.getProductId());
            item.setQuantity(reqItem.getQuantity());

            // c. SỬ DỤNG GIÁ TỪ PRODUCT-SERVICE (An toàn nhất)
            item.setPrice(productInfo.getPrice());

            item.setOrder(order);
            items.add(item);

            // Tính tổng tiền dựa trên giá chuẩn
            BigDecimal lineTotal = productInfo.getPrice().multiply(BigDecimal.valueOf(reqItem.getQuantity()));
            total = total.add(lineTotal);
        }


        order.setItems(items);
        order.setTotalPrice(total);

        // lƯU VÀO DATABASE BẰNG REPOSITORY ĐÃ TẠO Ở BƯỚC 2
        Order saveOrder = orderRepository.save(order);

        // MAP dữ liệu từ entity sang response dto để trả về cho khách
        OrderResponse response = mapToResponse(saveOrder);
        
        System.out.println("DEBUG: userName before setting = " + userName);
        response.setUserName(userName);
        
        // Bổ sung Product Name cho từng item (Sử dụng Map để đảm bảo chính xác)
        java.util.Map<Long, String> productNames = new java.util.HashMap<>();
        for (OrderItemRequest itemReq : request.getOrderItems()) {
             try {
                 ApiResponse<ProductResponse> pRes = productClient.getProductById(itemReq.getProductId());
                 if (pRes != null && pRes.getData() != null) {
                     productNames.put(itemReq.getProductId(), pRes.getData().getName());
                 }
             } catch (Exception e) {
                 productNames.put(itemReq.getProductId(), "Sản phẩm không rõ");
             }
        }

        if (response.getItems() != null) {
            for (OrderItemResponse itemRes : response.getItems()) {
                String pName = productNames.get(itemRes.getProductId());
                System.out.println("DEBUG: Mapping pId=" + itemRes.getProductId() + " to pName=" + pName);
                itemRes.setProductName(pName);
            }
        }

        return response;
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUserId());
        response.setAddress(order.getAddress());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());

        // Map cái list Item bên trong
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderItemResponse itemRes = new OrderItemResponse();
            itemRes.setProductId(item.getProductId());
            itemRes.setQuantity(item.getQuantity());
            itemRes.setPrice(item.getPrice());
            return itemRes;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);
        return response;
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        // 1. Fetch user information to get userName
        String userName = "Người dùng ẩn danh";
        try {
            var userProfile = userClient.getUserById(userId);
            if (userProfile != null && userProfile.getFullName() != null) {
                userName = userProfile.getFullName();
            }
        } catch (Exception e) {
            System.err.println("Không lấy được thông tin người dùng: " + e.getMessage());
        }

        // 2. Fetch orders
        List<Order> orders = orderRepository.findByUserId(userId);
        
        // 3. Map orders to response
        final String finalUserName = userName;
        return orders.stream().map(order -> {
            OrderResponse response = mapToResponse(order);
            response.setUserName(finalUserName);

            if (response.getItems() != null) {
                response.getItems().forEach(itemObj -> {
                    try {
                        ApiResponse<ProductResponse> productRes = productClient.getProductById(itemObj.getProductId());
                        if (productRes != null && productRes.getData() != null) {
                            itemObj.setProductName(productRes.getData().getName());
                        }
                    } catch (Exception e) {
                        itemObj.setProductName("Sản phẩm không rõ");
                    }
                });
            }
            return response;
        }).collect(Collectors.toList());
    }
}
