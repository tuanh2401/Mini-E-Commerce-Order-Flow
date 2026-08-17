package com.example.product_service.controller;

import com.example.lib.model.response.BaseResponse;
import com.example.product_service.dto.response.FavoriteProductResponse;
import com.example.product_service.service.FavoriteProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/favorites")
@Slf4j
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class FavoriteProductController {

    private final FavoriteProductService favoriteProductService;

    /**
     * Thêm sản phẩm vào danh sách yêu thích của User đang đăng nhập.
     * URL: POST /api/products/favorites/{productId}
     */
    @PostMapping("/{productId}")
    public ResponseEntity<BaseResponse<Void>> addFavoriteProduct(@PathVariable Long productId) {
        log.info("Nhận yêu cầu thêm sản phẩm ID [{}] vào danh sách yêu thích", productId);
        favoriteProductService.addFavorite(productId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success(HttpStatus.CREATED, null));
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích của User đang đăng nhập.
     * URL: DELETE /api/products/favorites/{productId}
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<BaseResponse<Void>> removeFavoriteProduct(@PathVariable Long productId) {
        log.info("Nhận yêu cầu xóa sản phẩm ID [{}] khỏi danh sách yêu thích", productId);
        favoriteProductService.removeFavorite(productId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }

    /**
     * Lấy danh sách sản phẩm yêu thích của User đang đăng nhập.
     * URL: GET /api/products/favorites
     */
    @GetMapping
    public ResponseEntity<BaseResponse<List<FavoriteProductResponse>>> getUserFavorites() {
        log.info("Nhận yêu cầu lấy danh sách sản phẩm yêu thích");
        List<FavoriteProductResponse> favorites = favoriteProductService.getUserFavorites();
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, favorites));
    }

    /**
     * Kiểm tra trạng thái yêu thích của 1 sản phẩm đối với User đang đăng nhập.
     * URL: GET /api/products/favorites/{productId}/status
     */
    @GetMapping("/{productId}/status")
    public ResponseEntity<BaseResponse<Boolean>> checkFavoriteStatus(@PathVariable Long productId) {
        log.info("Nhận yêu cầu kiểm tra trạng thái yêu thích của sản phẩm ID [{}]", productId);
        boolean isFavorited = favoriteProductService.checkFavoriteStatus(productId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, isFavorited));
    }
}