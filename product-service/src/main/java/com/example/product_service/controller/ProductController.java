package com.example.product_service.controller;

import com.example.lib.controller.BaseController;
import com.example.lib.model.dto.BaseDto;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.service.ProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products")
public class ProductController extends BaseController<ProductService, ProductResponse, Long> {

    /**
     * Ghi đè API Tạo mới sản phẩm để cấu hình Phân quyền bảo mật.
     */
    @Override
    @PostMapping
    @PreAuthorize("@ss.hasPermission('PRODUCT_CREATE')")
    public ResponseEntity<?> create(@RequestBody @Validated(BaseDto.Create.class) BaseRequest<ProductResponse> dto) {
        log.info("Nhận yêu cầu tạo sản phẩm mới tên: {}", dto.getData().getName());
        return super.create(dto);
    }

    /**
     * Ghi đè API Cập nhật sản phẩm để cấu hình Phân quyền bảo mật.
     */
    @Override
    @PostMapping("/{id}")
    @PreAuthorize("@ss.hasPermission('PRODUCT_UPDATE')")
    public ResponseEntity<?> update(@RequestBody @Validated(BaseDto.Update.class) BaseRequest<ProductResponse> dto, @PathVariable("id") Long id) {
        log.info("Admin đang cập nhật sản phẩm có ID: [{}]. Tên mới: {}", id, dto.getData().getName());
        return super.update(dto, id);
    }

    /**
     * Ghi đè API Xóa mềm sản phẩm theo ID để cấu hình Phân quyền bảo mật.
     */
    @Override
    @DeleteMapping("/{id}")
    @PreAuthorize("@ss.hasPermission('PRODUCT_DELETE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        log.warn("Admin đang thực hiện xóa sản phẩm ID : [{}]", id);
        return super.delete(id);
    }

    /**
     * API Nội bộ (Feign Client gọi) lấy chi tiết 1 sản phẩm.
     */
    @GetMapping("/internal/{id}")
    public ResponseEntity<BaseResponse<ProductResponse>> getInternalProductById(@PathVariable Long id) {
        log.info("[Nội bộ] Order Service đang lấy thông tin sản phẩm ID: {}", id);
        BaseResponse<ProductResponse> response = service.getDetails(id);
        return ResponseEntity.ok(response);
    }

    /**
     * API Nội bộ (Feign Client gọi) trừ kho sản phẩm khi thanh toán thành công.
     */
    @PutMapping("/internal/{id}/reduce-stock")
    public ResponseEntity<BaseResponse<Void>> reduceStockInternal(@PathVariable Long id, @RequestParam Integer quantity) {
        log.info("[Nội bộ] Order Service đang yêu cầu trừ {} sản phẩm của ID: {}", quantity, id);
        service.reduceStock(id, quantity);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }

    /**
     * API Tải ảnh sản phẩm lên hệ thống.
     */
    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@ss.hasPermission('PRODUCT_UPDATE')")
    public ResponseEntity<BaseResponse<ProductResponse>> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        log.info("Nhận yêu cầu tải ảnh lên cho sản phẩm ID: {}", id);
        ProductResponse response = service.uploadProductImage(id, file);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * API Lấy danh sách sản phẩm thuộc Danh mục (Category).
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<BaseResponse<List<ProductResponse>>> getProductsByCategory(@PathVariable Long categoryId) {
        log.info("Yêu cầu lấy danh sách sản phẩm thuộc danh mục ID: {}", categoryId);
        List<ProductResponse> responses = service.getProductsByCategory(categoryId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, responses));
    }
}