package com.example.product_service.controller;

import com.example.lib.controller.BaseController;
import com.example.lib.model.dto.BaseDto;
import com.example.lib.model.request.BaseRequest;
import com.example.product_service.dto.response.CategoryResponse;
import com.example.product_service.service.CategoryService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/categories")
public class CategoryController extends BaseController<CategoryService, CategoryResponse, Long> {

    /**
     * Ghi đè API Tạo mới danh mục để cấu hình Phân quyền bảo mật.
     */
    @Override
    @PostMapping
    @PreAuthorize("@ss.hasPermission('PRODUCT_CREATE')")
    public ResponseEntity<?> create(@RequestBody @Validated(BaseDto.Create.class) BaseRequest<CategoryResponse> dto) {
        log.info("Yêu cầu tạo danh mục mới : {}", dto.getData().getName());
        return super.create(dto);
    }

    /**
     * Ghi đè API Cập nhật danh mục để cấu hình Phân quyền bảo mật.
     */
    @Override
    @PostMapping("/{id}")
    @PreAuthorize("@ss.hasPermission('CATEGORY_UPDATE')")
    public ResponseEntity<?> update(@RequestBody @Validated(BaseDto.Update.class) BaseRequest<CategoryResponse> dto, @PathVariable("id") Long id) {
        log.info("Yêu cầu cập nhật danh mục ID: {}. Tên mới: {}", id, dto.getData().getName());
        return super.update(dto, id);
    }

    /**
     * Ghi đè API Xóa mềm danh mục theo ID để cấu hình Phân quyền bảo mật.
     */
    @Override
    @DeleteMapping("/{id}")
    @PreAuthorize("@ss.hasPermission('CATEGORY_DELETE')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        log.warn("Yêu cầu xóa danh mục ID: {}", id);
        return super.delete(id);
    }
}