package com.example.product_service.service.impl;

import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.BaseService;
import com.example.product_service.client.OrderClient;
import com.example.product_service.dto.response.ReviewResponse;
import com.example.product_service.dto.response.ReviewSummaryResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.entity.ProductReview;
import com.example.product_service.exception.Message;
import com.example.product_service.exception.ProductNotFoundException;
import com.example.product_service.mapper.ProductReviewMapper;
import com.example.product_service.repository.ProductRepository;
import com.example.product_service.repository.ProductReviewRepository;
import com.example.product_service.service.ProductReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
public class    ProductReviewServiceImpl extends BaseService<ProductReviewRepository, ReviewResponse, ProductReview, ProductReviewMapper, Long> implements ProductReviewService {

    private final ProductRepository productRepository;
    private final OrderClient orderClient;
    private final HttpServletRequest request;

    // Chỉ tiêm các repository/service ngoài lớp Base.
    // ProductReviewRepository và ProductReviewMapper đã tự động được tiêm ở BaseService cha.
    public ProductReviewServiceImpl(ProductRepository productRepository, OrderClient orderClient, HttpServletRequest request) {
        this.productRepository = productRepository;
        this.orderClient = orderClient;
        this.request = request;
    }

    /**
     * Ghi đè hàm tạo mới Đánh giá sản phẩm.
     * Bổ sung kiểm tra lịch sử mua hàng và trùng lặp đánh giá.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<ReviewResponse> create(BaseRequest<ReviewResponse> dto) {
        BaseResponse<ReviewResponse> response = new BaseResponse<>();
        try {
            ReviewResponse data = dto.getData();
            String userId = getCurrentId();
            log.info("User [{}] yêu cầu thêm đánh giá cho sản phẩm [{}]", userId, data.getProductId());

            // 1. Tìm sản phẩm trong DB
            Product product = productRepository.findById(data.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(data.getProductId()));

            // 2. Kiểm tra lịch sử mua hàng từ Order Service qua Feign
            Long userIdLong = Long.valueOf(userId);
            var hasPurchasedRes = orderClient.hasPurchasedProduct(userIdLong, data.getProductId());
            if (hasPurchasedRes == null || hasPurchasedRes.getData() == null || !hasPurchasedRes.getData()) {
                log.warn("User [{}] chưa từng mua hoặc chưa thanh toán thành công sản phẩm ID [{}]", userId, data.getProductId());
                return BaseResponse.fail(HttpStatus.BAD_REQUEST, messageHelper.getMessage(Message.REVIEW_NOT_PURCHASED.getMessage()));
            }

            // 3. Kiểm tra xem user đã đánh giá sản phẩm này chưa
            if (repository.existsByUserIdAndProductId(userId, data.getProductId())) {
                log.warn("User [{}] đã đánh giá sản phẩm ID [{}] trước đó rồi", userId, data.getProductId());
                return BaseResponse.fail(HttpStatus.CONFLICT, messageHelper.getMessage(Message.REVIEW_ALREADY_EXISTS.getMessage()));
            }

            // 4. Lưu đánh giá mới vào DB thông qua Mapper MapStruct
            ProductReview productReview = mapper.toEntity(data);
            productReview.setUserId(userId);
            productReview.setProduct(product);

            ProductReview savedProductReview = repository.save(productReview);
            log.info("Lưu thành công đánh giá cho sản phẩm [{}] bởi User [{}]", product.getName(), userId);

            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(savedProductReview));
        } catch (Exception ex) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessage(ex.getMessage());
        }
        return response;
    }

    /**
     * Ghi đè hàm cập nhật Đánh giá.
     * Bổ sung kiểm tra xem User hiện tại có đúng là chủ sở hữu của đánh giá không.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<ReviewResponse> update(BaseRequest<ReviewResponse> dto) {
        BaseResponse<ReviewResponse> response = new BaseResponse<>();
        try {
            ReviewResponse data = dto.getData();
            String userId = getCurrentId();
            log.info("User [{}] yêu cầu cập nhật đánh giá ID [{}]", userId, data.getId());

            ProductReview review = repository.findById(data.getId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, Message.REVIEW_NOT_FOUND.getMessage(), new Object[]{data.getId()}));

            // Kiểm tra quyền sở hữu
            if (!review.getUserId().equals(userId)) {
                log.warn("User [{}] không có quyền sửa đánh giá ID [{}] của user [{}]", userId, data.getId(), review.getUserId());
                return BaseResponse.fail(HttpStatus.FORBIDDEN, messageHelper.getMessage(Message.REVIEW_UNAUTHORIZED.getMessage()));
            }

            // Cập nhật Entity từ DTO sử dụng MapStruct
            mapper.updateFromDTO(data, review);
            ProductReview updatedReview = repository.save(review);
            log.info("Cập nhật thành công đánh giá ID [{}]", data.getId());

            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(updatedReview));
        } catch (Exception ex) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessage(ex.getMessage());
        }
        return response;
    }

    /**
     * Ghi đè hàm xóa Đánh giá.
     * Bổ sung kiểm tra quyền sở hữu trước khi thực hiện xóa.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<ReviewResponse> delete(Long reviewId) {
        BaseResponse<ReviewResponse> response = new BaseResponse<>();
        try {
            String userId = getCurrentId();
            log.info("User [{}] yêu cầu xóa đánh giá ID [{}]", userId, reviewId);

            ProductReview review = repository.findById(reviewId)
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, Message.REVIEW_NOT_FOUND.getMessage(), new Object[]{reviewId}));

            // Kiểm tra quyền sở hữu
            if (!review.getUserId().equals(userId)) {
                log.warn("User [{}] không có quyền xóa đánh giá ID [{}] của User [{}]", userId, reviewId, review.getUserId());
                return BaseResponse.fail(HttpStatus.FORBIDDEN, messageHelper.getMessage(Message.REVIEW_UNAUTHORIZED.getMessage()));
            }

            repository.softDelete(reviewId, java.time.LocalDateTime.now(), java.time.LocalDateTime.now());
            log.info("Đã xóa mềm thành công đánh giá ID [{}]", reviewId);

            response.setStatus(HttpStatus.OK);
            response.setMessage(messageHelper.getMessage("common.delete_success"));
        } catch (Exception ex) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessage(ex.getMessage());
        }
        return response;
    }

    /**
     * Nghiệp vụ đặc thù lấy báo cáo tổng số sao của sản phẩm.
     */
    @Override
    public ReviewSummaryResponse getReviewSummary(Long productId) {
        log.info("Tính toán thống kê đánh giá sản phẩm của ID [{}]", productId);

        if (!productRepository.existsById(productId)) {
            log.error("Sản phẩm ID [{}] không tồn tại để lấy thống kê đánh giá", productId);
            throw new ProductNotFoundException(productId);
        }

        List<ProductReview> reviews = repository.findByProductId(productId);
        long reviewCount = reviews.size();
        double averageRating = reviews.stream().mapToInt(ProductReview::getRating).average().orElse(0.0);
        double roundedAverage = Math.round(averageRating * 10.0) / 10.0;

        return ReviewSummaryResponse.builder()
                .averageRating(roundedAverage)
                .reviewCount(reviewCount)
                .build();
    }

    private String getCurrentId() {
        return request.getHeader("UserId");
    }
}