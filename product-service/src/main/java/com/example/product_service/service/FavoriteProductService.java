package com.example.product_service.service;

import com.example.lib.service.IBaseService;
import com.example.product_service.dto.response.FavoriteProductResponse;
import com.example.product_service.entity.FavoriteProduct;
import com.example.product_service.mapper.FavoriteProductMapper;
import com.example.product_service.repository.FavoriteProductRepository;

import java.util.List;

/**
 * Interface nghiệp vụ Sản phẩm yêu thích kế thừa IBaseService generic.
 */
public interface FavoriteProductService extends IBaseService<FavoriteProductRepository, FavoriteProductResponse, FavoriteProduct, FavoriteProductMapper, Long> {

    // 1. Thêm sản phẩm vào danh sách yêu thích
    void addFavorite(Long productId);

    // 2. Xóa sản phẩm khỏi danh sách yêu thích
    void removeFavorite(Long productId);

    // 3. Lấy danh sách sản phẩm yêu thích của User đang đăng nhập
    List<FavoriteProductResponse> getUserFavorites();

    // 4. Kiểm tra trạng thái yêu thích của 1 sản phẩm
    boolean checkFavoriteStatus(Long productId);
}