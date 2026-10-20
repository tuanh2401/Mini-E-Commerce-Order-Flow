package com.example.product_service.controller;

import com.example.lib.model.response.BaseResponse;
import com.example.product_service.dto.response.BannerResponse;
import com.example.product_service.service.BannerService;
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
@RequestMapping("/api/products/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    /**
     * API công khai lấy danh sách banner đang hoạt động cho Trang chủ
     * URL: GET /api/products/banners
     */
    @GetMapping
    public ResponseEntity<BaseResponse<List<BannerResponse>>> getActiveBanners() {
        List<BannerResponse> banners = bannerService.getActiveBanners();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, banners));
    }

    /**
     * API quản trị lấy tất cả banner (bao gồm cả banner ẩn)
     * URL: GET /api/products/banners/all
     */
    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<List<BannerResponse>>> getAllBanners() {
        List<BannerResponse> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, banners));
    }

    /**
     * API Upload ảnh banner lên MinIO và tạo mới banner trong CSDL
     * URL: POST /api/products/banners
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<BannerResponse>> createBanner(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "active", required = false, defaultValue = "true") Boolean active) {
        log.info("Nhận yêu cầu upload banner mới lên MinIO: tiêu đề = {}", title);
        BannerResponse created = bannerService.createBanner(file, title, linkUrl, displayOrder, active);
        return ResponseEntity.status(HttpStatus.CREATED).body(BaseResponse.success(HttpStatus.CREATED, created));
    }

    /**
     * API Cập nhật banner (có thể kèm file ảnh mới hoặc không)
     * URL: PUT /api/products/banners/{id}
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<BannerResponse>> updateBanner(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "linkUrl", required = false) String linkUrl,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "active", required = false) Boolean active) {
        log.info("Nhận yêu cầu cập nhật banner ID = {}", id);
        BannerResponse updated = bannerService.updateBanner(id, file, title, linkUrl, displayOrder, active);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, updated));
    }

    /**
     * API Bật/Tắt hiển thị banner
     * URL: PUT /api/products/banners/{id}/toggle
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<BannerResponse>> toggleBanner(@PathVariable Long id) {
        BannerResponse toggled = bannerService.toggleBannerActive(id);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, toggled));
    }

    /**
     * API Xóa banner và file ảnh trên MinIO
     * URL: DELETE /api/products/banners/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<String>> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, "Đã xóa banner thành công!"));
    }
}
