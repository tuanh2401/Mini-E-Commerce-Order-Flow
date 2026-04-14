package com.example.product_service.controller;
import com.example.lib.dto.ApiResponse;
import com.example.product_service.dto.ProductRequest;
import com.example.product_service.dto.ProductResponse;
import com.example.product_service.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    // 1. TẠO MỚI SẢN PHẨM (POST)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        log.info("Nhận yêu cầu tạo sản phẩm mới tên: {}", request.getName());
        log.debug("Dữ liệu đầy đủ của yêu cầu là : {}", request);
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created Successfully", response));
    }

    // 2. LẤY TẤT CẢ DỮ LIỆU (GET)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll() {
        List<ProductResponse> responses = productService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Fetched all products successfully", responses));
    }

    // 3. LẤY CHI TIẾT 1 SẢN PHẨM (GET)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Fetched product successfully", response));
    }

    // --- API NỘI BỘ DÀNH CHO FEIGN CLIENT ---
    @GetMapping("/internal/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getInternalProductById(@PathVariable Long id) {
        log.info("[Nội bộ] Order Service đang lấy thông tin sản phẩm ID: {}", id);
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Fetched product successfully", response));
    }

    // 4. SỬA SẢN PHẨM (PUT)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    // 5. XÓA SẢN PHẨM (DELETE)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    // 6. TRỪ KHO (PUT) - Gọi nội bộ từ Order Service
    @PutMapping("/internal/{id}/reduce-stock")
    public ResponseEntity<ApiResponse<Void>> reduceStockInternal(@PathVariable Long id, @RequestParam Integer quantity) {
        log.info("[Nội bộ] Order Service đang yêu cầu trừ {} sản phẩm của ID: {}", quantity, id);
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Stock reduced successfully", null));
    }
}
