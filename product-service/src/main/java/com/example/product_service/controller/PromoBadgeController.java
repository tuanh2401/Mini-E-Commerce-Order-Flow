package com.example.product_service.controller;

import com.example.lib.model.response.BaseResponse;
import com.example.product_service.dto.response.PromoBadgeResponse;
import com.example.product_service.service.PromoBadgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products/badges")
@RequiredArgsConstructor
public class PromoBadgeController {

    private final PromoBadgeService promoBadgeService;

    /**
     * API công khai lấy danh sách Badge quảng cáo đang kích hoạt
     * URL: GET /api/products/badges
     */
    @GetMapping
    public ResponseEntity<BaseResponse<List<PromoBadgeResponse>>> getActiveBadges() {
        List<PromoBadgeResponse> badges = promoBadgeService.getActiveBadges();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, badges));
    }

    /**
     * API quản trị lấy tất cả Badges
     * URL: GET /api/products/badges/all
     */
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<List<PromoBadgeResponse>>> getAllBadges() {
        List<PromoBadgeResponse> badges = promoBadgeService.getAllBadges();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, badges));
    }

    /**
     * API tải ảnh lên MinIO và tạo mới Badge
     * URL: POST /api/products/badges
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<PromoBadgeResponse>> createBadge(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "active", required = false, defaultValue = "true") Boolean active) {
        log.info("Nhận yêu cầu upload badge mới lên MinIO: tiêu đề = {}", title);
        PromoBadgeResponse created = promoBadgeService.createBadge(file, title, linkUrl, displayOrder, active);
        return ResponseEntity.status(HttpStatus.CREATED).body(BaseResponse.success(HttpStatus.CREATED, created));
    }

    /**
     * API Cập nhật Badge
     * URL: PUT /api/products/badges/{id}
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<PromoBadgeResponse>> updateBadge(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "active", required = false) Boolean active) {
        log.info("Nhận yêu cầu cập nhật badge ID = {}", id);
        PromoBadgeResponse updated = promoBadgeService.updateBadge(id, file, title, linkUrl, displayOrder, active);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, updated));
    }

    /**
     * API Bật/Tắt hiển thị Badge
     * URL: PUT /api/products/badges/{id}/toggle
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<PromoBadgeResponse>> toggleBadge(@PathVariable Long id) {
        PromoBadgeResponse toggled = promoBadgeService.toggleBadgeActive(id);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, toggled));
    }

    /**
     * API Xóa Badge và ảnh tương ứng trên MinIO
     * URL: DELETE /api/products/badges/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<String>> deleteBadge(@PathVariable Long id) {
        promoBadgeService.deleteBadge(id);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, "Đã xóa badge thành công!"));
    }
}
