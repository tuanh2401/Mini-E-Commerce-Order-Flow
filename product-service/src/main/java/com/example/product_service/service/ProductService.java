package com.example.product_service.service;

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
@RequiredArgsConstructor
public class ProductService {
    //Tiêm thợ xây DB
    private final ProductRepository productRepository;
    //1. Tạo sp mới
    public ProductResponse createProduct(ProductRequest Request) {
        //Biến DTO request thành Entity để đưa vào DB
        Product product = Product.builder()
                .name(Request.getName())
                .description(Request.getDescription())
                .price(Request.getPrice())
                .stock(Request.getStock())
                .build();
        //Tx lưu xuống DB
        product = productRepository.save(product);
        //Chuyển kết quả thành DTO response trả về
        return mapToResponse(product);
    }
    //2. Lấy danh sách all sp
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    //3.Xem chi tiết 1 sản phẩm theo id
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi : Không tìm thấy sản phẩm này"));
        return mapToResponse(product);
    }
    //4.Sửa sản phẩm theo id
    public ProductResponse updateProduct( Long id,ProductRequest Request) {
        //Tìm xem sản phẩm có tồn tại trong db k
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi : Không thể cập nhật vì không tìm thấy sản phẩm!"));
        //Lấy thông tin mới đắp vào thông tin cũ
        product.setName(Request.getName());
        product.setDescription(Request.getDescription());
        product.setPrice(Request.getPrice());
        product.setStock(Request.getStock());
        //Bảo DB lưu lại bản cập nhât
        product = productRepository.save(product);
        return mapToResponse(product);
    }
    // 5. Xóa sản phẩm
    public void deleteProduct(Long id) {
        if(!productRepository.existsById(id)) {
            throw new RuntimeException("Lỗi : xóa thất bại do không tìm thấy sản phẩm");
        }
        productRepository.deleteById(id);
    }

    // 6. Trừ kho khi có đơn hàng
    public void reduceStock(Long id, Integer quantity) {
        Product product = productRepository.findByIdWithLock(id)
                .orElseThrow(() -> new RuntimeException("Lỗi : Không tìm thấy sản phẩm để trừ kho"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Lỗi : Số lượng tồn kho không đủ (Hiện có: " + product.getStock() + ")");
        }

        product.setStock(product.getStock() - quantity);
        productRepository.save(product);
    }

    // Hàm tiện ích
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .build();
    }
}
