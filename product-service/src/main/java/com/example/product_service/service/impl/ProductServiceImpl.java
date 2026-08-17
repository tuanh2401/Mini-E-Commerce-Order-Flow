package com.example.product_service.service.impl;

import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.BaseService;
import com.example.lib.service.MinioService;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.exception.CategoryNotFoundException;
import com.example.product_service.exception.Message;
import com.example.product_service.exception.ProductNotFoundException;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.repository.CategoryRepository;
import com.example.product_service.repository.ProductRepository;
import com.example.product_service.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Transactional
@Service
public class ProductServiceImpl extends BaseService<ProductRepository, ProductResponse, Product, ProductMapper, Long> implements ProductService {

    private final MinioService minioService;
    private final CategoryRepository categoryRepository;

    // Chỉ tiêm các repository/service ngoài lớp Base.
    // ProductRepository và ProductMapper đã được tự động tiêm ở lớp cha BaseService
    public ProductServiceImpl(MinioService minioService, CategoryRepository categoryRepository) {
        this.minioService = minioService;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Lấy danh sách sản phẩm thuộc Danh mục
     */
    @Override
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new CategoryNotFoundException(categoryId);
        }
        // Gọi repository và mapper thừa hưởng từ BaseService cha
        return repository.findByCategoryId(categoryId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Giảm số lượng sản phẩm tồn kho khi đơn hàng được thanh toán
     */
    @Override
    public void reduceStock(Long id, Integer quantity) {
        log.info("Bắt đầu xử lý trừ kho cho sản phẩm với ID : [{}] , số lượng yêu cầu {}", id, quantity);
        Product product = repository.findProductById(id)
                .orElseThrow(() -> {
                    log.error("Không tìm thấy sản phẩm ID: [{}] trong quá trình trừ kho", id);
                    return new ProductNotFoundException(id);
                });

        if (product.getStock() < quantity) {
            log.warn("TRỪ KHO THẤT BẠI: Sản phẩm ID [{}]. Tồn kho hiện có: {}. Số lượng yêu cầu {}", id, product.getStock(), quantity);
            throw new BusinessException(HttpStatus.CONFLICT, Message.PRODUCT_STOCK_INSUFFICIENT.getMessage(), null);
        }

        product.setStock(product.getStock() - quantity);
        repository.save(product);
        log.info("TRỪ KHO THÀNH CÔNG: SẢN PHẨM ID [{}]. Kho mới: {}", id, product.getStock());
    }

    /**
     * Tải ảnh sản phẩm lên MinIO
     */
    @Override
    public ProductResponse uploadProductImage(Long id, MultipartFile file) {
        log.info("Bắt đầu xử lý tải ảnh lên cho sản phẩm ID : {}", id);
        Product product = repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        String oldImageUrl = product.getImageUrl();
        String imageUrl = minioService.uploadFile(file, "products");
        product.setImageUrl(imageUrl);
        Product updatedProduct = repository.save(product);

        if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
            minioService.deleteFile(oldImageUrl);
        }
        log.info("Cập nhật ảnh thành công cho sản phẩm ID: {} . URL : {}", id, imageUrl);
        return mapper.toDto(updatedProduct);
    }

    @Override
    @Transactional
    public BaseResponse<ProductResponse> create(BaseRequest<ProductResponse> dto) {
        try {
            if (isDuplicate(dto)) {
                String localizedMsg = messageHelper.getMessage("common.already_exists");
                return BaseResponse.fail(HttpStatus.BAD_REQUEST, localizedMsg);
            }
            Product product = mapper.toEntity(dto.getData());
            prepareEntityForCreate(product);

            if (dto.getData().getCategoryId() != null) {
                com.example.product_service.entity.Category category = categoryRepository.findById(dto.getData().getCategoryId())
                        .orElseThrow(() -> new CategoryNotFoundException(dto.getData().getCategoryId()));
                product.setCategory(category);
            }

            Product saved = repository.save(product);

            BaseResponse<ProductResponse> response = new BaseResponse<>();
            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(saved));
            response.setMessage(getSuccessMessage("create"));
            return response;
        } catch (Exception ex) {
            throw new RuntimeException("Tạo mới sản phẩm thất bại", ex);
        }
    }

    @Override
    @Transactional
    public BaseResponse<ProductResponse> update(BaseRequest<ProductResponse> dto) {
        try {
            Long id = dto.getData().getId();
            Product product = repository.findEntityById(id)
                    .orElseThrow(() -> new ProductNotFoundException(id));

            mapper.updateFromDTO(dto.getData(), product);

            if (dto.getData().getCategoryId() != null) {
                com.example.product_service.entity.Category category = categoryRepository.findById(dto.getData().getCategoryId())
                        .orElseThrow(() -> new CategoryNotFoundException(dto.getData().getCategoryId()));
                product.setCategory(category);
            } else {
                product.setCategory(null);
            }

            Product updated = repository.save(product);

            BaseResponse<ProductResponse> response = new BaseResponse<>();
            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(updated));
            response.setMessage(getSuccessMessage("update"));
            return response;
        } catch (Exception ex) {
            throw new RuntimeException("Cập nhật sản phẩm thất bại", ex);
        }
    }
    @Override
    @Transactional
    public void increaseStock(Long id, Integer quantity) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, Message.PRODUCT_NOT_FOUND.getMessage(), null));
        product.setStock(product.getStock() + quantity);
        repository.save(product);
        log.info("Hoàn kho thành công cho sản phẩm [{}]. kho mới {}", id, product.getStock());
    }
}