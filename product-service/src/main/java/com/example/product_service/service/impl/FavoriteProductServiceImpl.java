package com.example.product_service.service.impl;

import com.example.lib.model.exception.BusinessException;
import com.example.lib.service.BaseService;
import com.example.product_service.dto.response.FavoriteProductResponse;
import com.example.product_service.entity.FavoriteProduct;
import com.example.product_service.entity.Product;
import com.example.product_service.exception.Message;
import com.example.product_service.exception.ProductNotFoundException;
import com.example.product_service.mapper.FavoriteProductMapper;
import com.example.product_service.repository.FavoriteProductRepository;
import com.example.product_service.repository.ProductRepository;
import com.example.product_service.service.FavoriteProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@Transactional
public class FavoriteProductServiceImpl extends BaseService<FavoriteProductRepository, FavoriteProductResponse, FavoriteProduct, FavoriteProductMapper, Long> implements FavoriteProductService {

    private final ProductRepository productRepository;

    // Chỉ tiêm ProductRepository để hỗ trợ liên kết.
    // FavoriteProductRepository và FavoriteProductMapper đã tự động được tiêm ở BaseService cha.
    public FavoriteProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Thêm sản phẩm vào danh sách yêu thích của User hiện tại.
     */
    @Override
    public void addFavorite(Long productId) {
        String userId = getCurrentUserId();
        log.info("User [{}] yêu cầu thêm sản phẩm [{}] vào giỏ hàng yêu thích", userId, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        // Kiểm tra xem sản phẩm đã được thêm yêu thích trước đó chưa
        if (repository.existsByUserIdAndProductId(userId, productId)) {
            log.warn("Sản phẩm ID [{}] đã tồn tại trong danh sách yêu thích của user [{}]", productId, userId);
            throw new BusinessException(HttpStatus.CONFLICT, Message.PRODUCT_ALREADY_FAVORITED.getMessage(), null);
        }

        FavoriteProduct favoriteProduct = FavoriteProduct.builder()
                .userId(userId)
                .product(product)
                .build();

        repository.save(favoriteProduct);
        log.info("Thêm thành công sản phẩm [{}] vào danh sách yêu thích của User [{}]", product.getName(), userId);
    }

    /**
     * Xóa sản phẩm khỏi danh sách yêu thích.
     */
    @Override
    public void removeFavorite(Long productId) {
        String userId = getCurrentUserId();
        log.info("User [{}] yêu cầu xóa sản phẩm [{}] khỏi danh thích", userId, productId);

        FavoriteProduct favoriteProduct = repository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, Message.PRODUCT_NOT_FOUND.getMessage(), null));

        repository.softDelete(favoriteProduct.getId(), java.time.LocalDateTime.now(), java.time.LocalDateTime.now());
        log.info("Đã xóa mềm sản phẩm ID [{}] khỏi danh sách yêu thích của User [{}]", productId, userId);
    }

    /**
     * Lấy danh sách sản phẩm yêu thích của User đang đăng nhập.
     */
    @Override
    public List<FavoriteProductResponse> getUserFavorites() {
        String userId = getCurrentUserId();
        log.info("Lấy danh sách yêu thích của User [{}]", userId);

        List<FavoriteProduct> favorites = repository.findByUserId(userId);

        // Sử dụng MapStruct tự động chuyển đổi danh sách Entity sang danh sách DTO
        return mapper.toDto(favorites);
    }

    /**
     * Kiểm tra xem sản phẩm hiện tại đã được User đánh dấu yêu thích chưa.
     */
    @Override
    public boolean checkFavoriteStatus(Long productId) {
        String userId = getCurrentUserId();
        log.info("Kiểm tra trạng thái yêu thích của sản phẩm ID [{}] bởi User [{}]", productId, userId);
        return repository.existsByUserIdAndProductId(userId, productId);
    }

    /**
     * Lấy UserId đang đăng nhập từ Security Context.
     */
    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}