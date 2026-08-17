package com.example.product_service.controller;

import com.example.lib.controller.BaseController;
import com.example.lib.model.dto.BaseDto;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.product_service.dto.response.ReviewResponse;
import com.example.product_service.dto.response.ReviewSummaryResponse;
import com.example.product_service.service.ProductReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/products/reviews")
public class ProductReviewController extends BaseController<ProductReviewService, ReviewResponse, Long> {

    /**
     * Ghi đè API Thêm đánh giá mới để cấu hình Phân quyền bảo mật.
     * URL: POST /api/products/reviews
     * Client gửi kèm productId bên trong request body data.
     */
    @Override
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody @Validated(BaseDto.Create.class) BaseRequest<ReviewResponse> dto) {
        log.info("Nhận yêu cầu thêm đánh giá cho sản phẩm ID [{}]", dto.getData().getProductId());
        return super.create(dto);

    }

    /**
     * Ghi đè API Cập nhật đánh giá cũ để cấu hình Phân quyền bảo mật.
     * URL: POST /api/products/reviews/{id}
     */
    @Override
    @PostMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> update(@RequestBody @Validated(BaseDto.Update.class) BaseRequest<ReviewResponse> dto, @PathVariable("id") Long id) {
        log.info("Nhận yêu cầu cập nhật đánh giá ID [{}]", id);
        return super.update(dto, id);
    }

    /**
     * Ghi đè API Xóa đánh giá để cấu hình Phân quyền bảo mật.
     * URL: DELETE /api/products/reviews/{id}
     */
    @Override
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        log.info("Nhận yêu cầu xóa đánh giá từ ID [{}]", id);
        return super.delete(id);
    }

    /**
     * API Thống kê số sao trung bình và tổng số đánh giá của sản phẩm (Public).
     * URL: GET /api/products/reviews/summary/{productId}
     */
    @GetMapping("/summary/{productId}")
    public ResponseEntity<BaseResponse<ReviewSummaryResponse>> getReviewSummary(@PathVariable Long productId) {
        log.info("Nhận yêu cầu lấy thống kê đánh giá của sản phẩm ID [{}]", productId);
        ReviewSummaryResponse summary = service.getReviewSummary(productId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, summary));
    }
}