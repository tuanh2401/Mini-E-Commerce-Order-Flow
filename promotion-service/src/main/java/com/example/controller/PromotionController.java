package com.example.controller;

import com.example.dto.request.ValidateVoucherRequest;
import com.example.dto.response.VoucherResponse;
import com.example.lib.controller.BaseController;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.service.VoucherService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@Slf4j
public class PromotionController extends BaseController<VoucherService, VoucherResponse, Long> {

    /**
     * Tạo mới mã Voucher (chỉ dành cho Admin).
     * URL: POST /api/promotions
     */
    @Override
    @PostMapping
    @PreAuthorize("@ss.hasPermission('PROMOTION_CREATE')")
    public ResponseEntity<?> create(@RequestBody BaseRequest<VoucherResponse> dto) {
        log.info("Yêu cầu tạo mới voucher: {}", dto.getData().getCode());
        return super.create(dto);
    }

    /**
     * Lấy danh sách toàn bộ Voucher (chỉ dành cho Admin).
     * URL: GET /api/promotions
     */
    @Override
    @GetMapping
    @PreAuthorize("@ss.hasPermission('PROMOTION_VIEW')")
    public ResponseEntity<?> getAll(
            @RequestParam java.util.Map<String, String> params,
            org.springframework.data.domain.Pageable pageable) {
        log.info("Yêu cầu lấy danh sách tất cả voucher (phân trang)");
        return super.getAll(params, pageable);
    }

    /**
     * API NỘI BỘ (Feign Client gọi từ Order Service) để kiểm tra và tính toán giảm giá.
     * URL: POST /api/promotions/internal/validate-and-calculate
     */
    @PostMapping("/internal/validate-and-calculate")
    public ResponseEntity<BaseResponse<BigDecimal>> validateAndCalculate(@Valid @RequestBody ValidateVoucherRequest request) {
        log.info("Yêu cầu kiểm tra & tính toán voucher: {}", request.getCode());
        BigDecimal discountAmount = service.validateAndCalculate(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, discountAmount));
    }

    /**
     * API NỘI BỘ (Feign Client gọi từ Order Service) để áp dụng và tăng số lượt dùng voucher.
     * URL: PUT /api/promotions/internal/apply
     */
    @PutMapping("/internal/apply")
    public ResponseEntity<BaseResponse<Void>> applyVoucher(@RequestParam String code) {
        log.info("Yêu cầu áp dụng (tăng usage) voucher: {}", code);
        service.apply(code);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }

    /**
     * Lấy danh sách Voucher khả dụng của người dùng.
     * URL: GET /api/promotions/active
     */
    @GetMapping("/active")
    @PreAuthorize("@ss.hasPermission('PROMOTION_ACTIVE_VIEW')")
    public ResponseEntity<BaseResponse<List<VoucherResponse>>> getActiveVouchers() {
        log.info("Người dùng yêu cầu lấy danh sách mã giảm giá khả dụng");
        List<VoucherResponse> response = service.getActiveVouchers();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }
}