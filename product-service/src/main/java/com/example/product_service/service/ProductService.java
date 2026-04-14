package com.example.product_service.service;

import com.example.lib.base.AbstractBaseService;
import com.example.product_service.dto.ProductRequest;
import com.example.product_service.dto.ProductResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Transactional
@Service
public class ProductService extends AbstractBaseService<Product, ProductRequest , ProductResponse , Long> {
    //Tiêm thợ xây DB
    private final ProductRepository productRepository;
    public ProductService(ProductRepository productRepository) {
        super(productRepository);
        this.productRepository = productRepository;
    }
    @Override
    protected Product mapToEntity(ProductRequest request, Product entity) {
        // Nếu là lệnh Tạo mới (Entity chưa tồn tại)
        if (entity == null) {
            return Product.builder()
                    .name(request.getName())
                    .description(request.getDescription())
                    .price(request.getPrice())
                    .stock(request.getStock())
                    .build();
        }
        // Nếu là lệnh Cập nhật (Entity đã có)
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setPrice(request.getPrice());
        entity.setStock(request.getStock());
        return entity;
    }

    @Override
    protected ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .build();
    }

    public void reduceStock(Long id, Integer quantity) {
        Product product = productRepository.findByIdWithLock(id)
                .orElseThrow(() -> new RuntimeException("Lỗi : Không tìm thấy sản phẩm để trừ kho"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Lỗi : Số lượng tồn kho không đủ (Hiện có: " + product.getStock() + ")");
        }

        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }


}
