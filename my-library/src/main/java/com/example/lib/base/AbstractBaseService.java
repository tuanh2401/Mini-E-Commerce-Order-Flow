package com.example.lib.base;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @param <E>   Entity (Ví dụ: Product, User)
 * @param <Req> DTO Request
 * @param <Res> DTO Response
 * @param <ID>  Kiểu ID
 */
public abstract class AbstractBaseService<E, Req, Res, ID> implements BaseService<Req, Res, ID> {

    // Không dùng @Autowired, bắt buộc class con phải truyền cái repo của nó vào đây
    protected final BaseRepository<E, ID> repository;

    public AbstractBaseService(BaseRepository<E, ID> repository) {
        this.repository = repository;
    }

    // --- 2 HÀM NÀY MỖI SERVICE CON TỰ PHẢI ĐỊNH NGHĨA VÌ MỖI THẰNG MAP KHÁC NHAU ---
    // Hàm copy dữ liệu từ Request (DTO) sang Mới/Cũ Entity
    protected abstract E mapToEntity(Req request, E entity);
    // Hàm copy dữ liệu từ Entity ra Response (DTO)
    protected abstract Res mapToResponse(E entity);

    // --- CÁC HÀM CRUD ĐÃ ĐƯỢC TỰ ĐỘNG HOÁ TOÀN BỘ LOGIC MÀ BẠN HAY COPY-PASTE ---

    @Override
    public Res create(Req request) {
        // null vì tạo mới chưa có Entity cũ
        E entity = mapToEntity(request, null);
        E savedEntity = repository.save(entity);
        return mapToResponse(savedEntity);
    }

    @Override
    public List<Res> getAll() {
        return repository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Res getById(ID id) {
        E entity = repository.findById(id)
                // Đỡ phải viết lại dòng orElseThrow khó chịu này ở mọi service
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy tài nguyên với ID: " + id));
        return mapToResponse(entity);
    }

    @Override
    public Res update(ID id, Req request) {
        E existingEntity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không thể cập nhật, không tìm thấy tài nguyên với ID: " + id));
        E updatedEntity = mapToEntity(request, existingEntity);
        updatedEntity = repository.save(updatedEntity);
        return mapToResponse(updatedEntity);
    }

    @Override
    public void delete(ID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Lỗi: Xóa thất bại, không tìm thấy tài nguyên với ID: " + id);
        }
        repository.deleteById(id);
    }
}
