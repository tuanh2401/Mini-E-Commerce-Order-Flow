package com.example.product_service.service.impl;

import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.BaseService;
import com.example.product_service.dto.response.CategoryResponse;
import com.example.product_service.entity.Category;
import com.example.product_service.exception.CategoryNotFoundException;
import com.example.product_service.exception.Message;
import com.example.product_service.mapper.CategoryMapper;
import com.example.product_service.repository.CategoryRepository;
import com.example.product_service.repository.ProductRepository;
import com.example.product_service.service.CategoryService;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Slf4j
@Transactional
@Service
public class CategoryServiceImpl extends BaseService<CategoryRepository, CategoryResponse, Category, CategoryMapper, Long> implements CategoryService {

    private final ProductRepository productRepository;

    // Chỉ tiêm ProductRepository để check ràng buộc khi xóa.
    // CategoryRepository và CategoryMapper đã được tiêm tự động ở lớp cha.
    public CategoryServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Ghi đè hàm kiểm tra trùng tên danh mục.
     * Hàm này được tự động gọi trước khi tạo mới hoặc cập nhật.
     */
    @Override
    protected boolean isDuplicate(BaseRequest<CategoryResponse> dto) {
        CategoryResponse data = dto.getData();
        if (data.getId() == null) {
            // Trường hợp tạo mới
            return repository.existsByName(data.getName());
        } else {
            // Trường hợp cập nhật: chỉ báo trùng nếu tên mới khác tên cũ và đã tồn tại trong DB
            Category existing = repository.findById(data.getId()).orElse(null);
            if (existing != null && !existing.getName().equals(data.getName())) {
                return repository.existsByName(data.getName());
            }
        }
        return false;
    }

    /**
     * Ghi đè hành vi xóa để bổ sung kiểm tra ràng buộc khóa ngoại (sản phẩm liên kết).
     */
    @Override
    public BaseResponse<CategoryResponse> delete(Long id) {
        log.info("Đang kiểm tra để xóa danh mục ID: {}", id);

        if (!repository.existsById(id)) {
            throw new CategoryNotFoundException(id);
        }

        // Kiểm tra xem danh mục này có chứa sản phẩm nào không
        if (productRepository.existsByCategoryId(id)) {
            log.warn("Không thể xóa danh mục ID: {} vì vẫn còn sản phẩm liên kết.", id);
            throw new BusinessException(HttpStatus.CONFLICT, Message.CATEGORY_HAS_PRODUCTS.getMessage(), null);
        }

        // Nếu hợp lệ, gọi đến hàm delete xóa mềm của lớp cha
        return super.delete(id);
    }
}