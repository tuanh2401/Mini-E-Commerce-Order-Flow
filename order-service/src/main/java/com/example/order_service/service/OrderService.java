package com.example.order_service.service;

import com.example.lib.service.IBaseService;
import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.entity.Order;
import com.example.order_service.mapper.OrderMapper;
import com.example.order_service.repository.OrderRepository;

import java.util.List;

/**
 * Interface nghiệp vụ Đơn hàng kế thừa IBaseService generic.
 * Lưu ý: Khóa chính của Order là kiểu String (UUID).
 */
public interface OrderService extends IBaseService<OrderRepository, OrderResponse, Order, OrderMapper, String> {

    // 1. Tạo một đơn hàng mới
    OrderResponse createOrder(Long userId, OrderRequest orderRequest);

    // 2. Lấy thông tin chi tiết đơn hàng (hỗ trợ phân quyền người dùng/Admin)
    OrderResponse getOrderById(String id, Long currentUserId, String role);

    // 3. Lấy lịch sử đơn hàng của người dùng
    List<OrderResponse> getOrdersByUserId(Long userId);

    // 4. Lấy tất cả đơn hàng (dành cho Admin)
    List<OrderResponse> getAllOrders();

    // 5. Kiểm tra khách hàng đã từng mua và thanh toán sản phẩm này chưa (gọi nội bộ từ Product Service)
    boolean hasPurchasedProduct(Long userId, Long productId);
}