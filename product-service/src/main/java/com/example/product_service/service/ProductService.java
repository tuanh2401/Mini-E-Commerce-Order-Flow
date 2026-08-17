package com.example.product_service.service;

import com.example.lib.service.IBaseService;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.repository.ProductRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Interface nghiệp vụ Sản phẩm kế thừa IBaseService generic.
 */
public interface ProductService extends IBaseService<ProductRepository, ProductResponse, Product, ProductMapper, Long> {

    // 1. Giảm số lượng tồn kho sản phẩm khi thanh toán thành công
    void reduceStock(Long id, Integer quantity);

    // 2. Tải ảnh đại diện sản phẩm lên hệ thống
    ProductResponse uploadProductImage(Long id, MultipartFile file);

    // 3. Lấy danh sách sản phẩm theo Danh mục (Category)
    List<ProductResponse> getProductsByCategory(Long categoryId);

    void increaseStock(Long id, Integer quantity);
}