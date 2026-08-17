package com.example.order_service.service.impl;

import com.example.lib.model.dto.OrderCreatedEvent;
import com.example.lib.model.dto.OrderItemEvent;
import com.example.lib.model.exception.BaseResourceNotFoundException;
import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.BaseService;
import com.example.order_service.client.ProductClient;
import com.example.order_service.client.PromotionClient;
import com.example.order_service.client.UserClient;
import com.example.order_service.dto.request.OrderItemRequest;
import com.example.order_service.dto.request.OrderRequest;
import com.example.order_service.dto.request.ValidateVoucherRequest;
import com.example.order_service.dto.response.OrderItemResponse;
import com.example.order_service.dto.response.OrderResponse;
import com.example.order_service.dto.response.ProductResponse;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.event.OrderEventPublisher;
import com.example.order_service.exception.Message;
import com.example.order_service.exception.OrderNotFoundException;
import com.example.order_service.mapper.OrderMapper;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.service.OrderService;
import com.example.order_service.dto.response.UserResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderServiceImpl extends BaseService<OrderRepository, OrderResponse, Order, OrderMapper, String> implements OrderService {

    private final ProductClient productClient;
    private final UserClient userClient;
    private final OrderEventPublisher orderEventPublisher;
    private final MessageSource messageSource;
    private final PromotionClient promotionClient;

    // OrderRepository và OrderMapper đã tự động được tiêm ở BaseService cha.
    public OrderServiceImpl(ProductClient productClient, UserClient userClient,
                            OrderEventPublisher orderEventPublisher, MessageSource messageSource,
                            PromotionClient promotionClient) {
        this.productClient = productClient;
        this.userClient = userClient;
        this.orderEventPublisher = orderEventPublisher;
        this.messageSource = messageSource;
        this.promotionClient = promotionClient;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        // Khởi tạo hóa đơn mới
        Order order = new Order();
        order.setUserId(userId);
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("PENDING");

        String userName = messageSource.getMessage("fallback.user.anonymous", null, LocaleContextHolder.getLocale());
        try {
            BaseResponse<UserResponse> userRes = userClient.getUserById(userId);
            var userProfile = userRes != null ? userRes.getData() : null;
            if (userProfile == null) {
                throw new BaseResourceNotFoundException("user.not.found", new Object[]{userId});
            }
            userName = userProfile.getFullName();
        } catch (Exception e) {
            log.warn("Cảnh báo: Lấy thông tin profile thất bại cho UserID [{}]. Sử dụng tên mặc định. Chi tiết: {}", userId, e.getMessage());
        }

        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            log.warn("Người dùng [{}] gửi đơn hàng trống, từ chối xử lý", userId);
            throw new BusinessException(HttpStatus.BAD_REQUEST, Message.ORDER_EMPTY.getMessage(), null);
        }

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest reqItem : request.getOrderItems()) {
            // Gọi Feign sang product-service sử dụng BaseResponse
            BaseResponse<ProductResponse> productRes = productClient.getProductById(reqItem.getProductId());

            if (productRes == null || productRes.getData() == null) {
                throw new BaseResourceNotFoundException("product.not.found", new Object[]{reqItem.getProductId()});
            }

            ProductResponse productInfo = productRes.getData();
            log.debug("Lấy thông tin sản phẩm ID [{}]: Tên=[{}], Giá=[{}]", reqItem.getProductId(), productInfo.getId(), productInfo.getName());

            OrderItem item = new OrderItem();
            item.setProductId(reqItem.getProductId());
            item.setQuantity(reqItem.getQuantity());
            item.setPrice(productInfo.getPrice());
            item.setOrder(order);
            items.add(item);

            BigDecimal lineTotal = productInfo.getPrice().multiply(BigDecimal.valueOf(reqItem.getQuantity()));
            total = total.add(lineTotal);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        String voucherCode = request.getVoucherCode();

        if (voucherCode != null && !voucherCode.trim().isEmpty()) {
            log.info("Đơn hàng sử dụng mã voucher: {}", voucherCode);
            try {
                // Gọi Feign sang promotion-service sử dụng BaseResponse
                BaseResponse<BigDecimal> promotionRes = promotionClient.validateAndCalculate(new ValidateVoucherRequest(voucherCode, total, userId));
                if (promotionRes != null && promotionRes.getData() != null) {
                    discountAmount = promotionRes.getData();
                    log.info("Mã voucher hợp lệ, số tiền được giảm: {}", discountAmount);
                } else {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, Message.VOUCHER_INVALID.getMessage(), null);
                }
            } catch (feign.FeignException e) {
                log.error("Lỗi khi kiểm tra voucher qua Feign: {}", e.contentUTF8());
                String responseBody = e.contentUTF8();
                String errorMessage = extractMessageFromJson(responseBody);
                if (errorMessage == null || errorMessage.trim().isEmpty()) {
                    errorMessage = Message.VOUCHER_INVALID.getMessage();
                }
                throw new BusinessException(HttpStatus.BAD_REQUEST, errorMessage, null);
            } catch (Exception e) {
                log.error("Lỗi khi kiểm tra voucher: {}", e.getMessage());
                throw new BusinessException(HttpStatus.BAD_REQUEST, Message.VOUCHER_INVALID.getMessage(), null);
            }
        }

        order.setItems(items);
        order.setVoucherCode(voucherCode);
        order.setDiscountAmount(discountAmount);

        BigDecimal finalPrice = total.subtract(discountAmount);
        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }
        order.setTotalPrice(finalPrice);

        Order savedOrder = repository.save(order);
        log.info("Đã lưu thành công đơn hàng vào DB với mã đơn: {}", savedOrder.getId());

        if (voucherCode != null && !voucherCode.trim().isEmpty()) {
            try {
                promotionClient.apply(voucherCode);
                log.info("Đã áp dụng (tăng lượt dùng) mã voucher thành công: {}", voucherCode);
            } catch (Exception e) {
                log.error("Cảnh báo: Không thể tăng usedCount cho voucher [{}]. Chi tiết: {}", voucherCode, e.getMessage());
            }
        }

        // Đẩy sự kiện đặt hàng lên RabbitMQ
        List<OrderItemEvent> eventItems = new ArrayList<>();
        for (OrderItem item : savedOrder.getItems()) {
            eventItems.add(new OrderItemEvent(item.getProductId(), item.getQuantity()));
        }
        OrderCreatedEvent event = new OrderCreatedEvent(savedOrder.getId(), savedOrder.getUserId(), eventItems);
        orderEventPublisher.pulishOrderCreatedEvent(event);
        log.info("Quy trình tạo đơn hàng hoàn tất cho đơn hàng [{}]", savedOrder.getId());

        // Sử dụng Mapper tự sinh thay thế hoàn toàn cho mapToResponse thủ công
        OrderResponse response = mapper.toDto(savedOrder);
        response.setUserName(userName);

        // Lấy tên sản phẩm để hiển thị trong chi tiết
        java.util.Map<Long, String> productNames = new java.util.HashMap<>();
        for (OrderItemRequest itemReq : request.getOrderItems()) {
            try {
                BaseResponse<ProductResponse> pRes = productClient.getProductById(itemReq.getProductId());
                if (pRes != null && pRes.getData() != null) {
                    productNames.put(itemReq.getProductId(), pRes.getData().getName());
                }
            } catch (Exception e) {
                productNames.put(itemReq.getProductId(),
                        messageSource.getMessage("fallback.product.unknown", null, LocaleContextHolder.getLocale()));
            }
        }

        if (response.getItems() != null) {
            for (OrderItemResponse itemRes : response.getItems()) {
                String pName = productNames.get(itemRes.getProductId());
                itemRes.setProductName(pName);
            }
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        String userName = messageSource.getMessage("fallback.user.anonymous", null, LocaleContextHolder.getLocale());
        try {
            BaseResponse<UserResponse> userRes = userClient.getUserById(userId);
            var userProfile = userRes != null ? userRes.getData() : null;
            if (userProfile != null && userProfile.getFullName() != null) {
                userName = userProfile.getFullName();
            }
        } catch (Exception e) {
            log.warn("Không lấy được thông tin người dùng: " + e.getMessage());
        }

        List<Order> orders = repository.findByUserId(userId);
        final String finalUserName = userName;

        return orders.stream().map(order -> {
            OrderResponse response = mapper.toDto(order);
            response.setUserName(finalUserName);

            if (response.getItems() != null) {
                response.getItems().forEach(itemObj -> {
                    try {
                        BaseResponse<ProductResponse> productRes = productClient.getProductById(itemObj.getProductId());
                        if (productRes != null && productRes.getData() != null) {
                            itemObj.setProductName(productRes.getData().getName());
                        }
                    } catch (Exception e) {
                        itemObj.setProductName(messageSource.getMessage("fallback.product.unknown", null, LocaleContextHolder.getLocale()));
                    }
                });
            }
            return response;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String orderId, Long currentUserId, String role) {
        Order order = repository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        if (!"ADMIN".equals(role) && !order.getUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này");
        }
        return mapper.toDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = repository.findAll();

        return orders.stream().map(order -> {
            OrderResponse response = mapper.toDto(order);

            try {
                BaseResponse<UserResponse> userRes = userClient.getUserById(order.getUserId());
                var userProfile = userRes != null ? userRes.getData() : null;
                if (userProfile != null && userProfile.getFullName() != null) {
                    response.setUserName(userProfile.getFullName());
                } else {
                    response.setUserName(messageSource.getMessage("fallback.user.anonymous", null, LocaleContextHolder.getLocale()));
                }
            } catch (Exception e) {
                log.warn("Không lấy được thông tin người dùng cho orderId={}: {}", order.getId(), e.getMessage());
                response.setUserName(messageSource.getMessage("fallback.user.anonymous", null, LocaleContextHolder.getLocale()));
            }

            if (response.getItems() != null) {
                response.getItems().forEach(itemObj -> {
                    try {
                        BaseResponse<ProductResponse> productRes = productClient.getProductById(itemObj.getProductId());
                        if (productRes != null && productRes.getData() != null) {
                            itemObj.setProductName(productRes.getData().getName());
                        }
                    } catch (Exception e) {
                        itemObj.setProductName(messageSource.getMessage("fallback.product.unknown", null, LocaleContextHolder.getLocale()));
                    }
                });
            }
            return response;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPurchasedProduct(Long userId, Long productId) {
        List<Order> orders = repository.findByUserId(userId);
        return orders.stream()
                .filter(order -> "PAID".equalsIgnoreCase(order.getStatus()))
                .anyMatch(order -> order.getItems().stream().anyMatch(item -> item.getProductId().equals(productId)));
    }

    private String extractMessageFromJson(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(json);
            if (node.has("message")) {
                return node.get("message").asText();
            }
        } catch (Exception e) {
            log.error("Lỗi parse JSON error message: {}", e.getMessage());
        }
        return null;
    }
}