package com.example.lib.controller;

import com.example.lib.model.dto.BaseDto;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.service.IBaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Lớp điều khiển Controller cha dạng generic.
 * Tự động cung cấp các API endpoint chuẩn cho CRUD dữ liệu.
 * S: Dịch vụ nghiệp vụ kế thừa từ IBaseService
 * D: DTO Response kế thừa từ BaseDto
 * ID: Kiểu khóa chính (ví dụ: Long, String)
 */
@Validated
public abstract class BaseController<
        S extends IBaseService<?, D, ?, ?, ID>,
        D extends BaseDto<ID>,
        ID> {

    @Autowired
    protected S service;

    /**
     * API Lấy danh sách (kèm phân trang, sắp xếp và lọc động)
     * URL ví dụ: GET /api/users?page=0&size=10&sort=id,desc&fullname=Dat
     */
    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam Map<String, String> params, Pageable pageable) {
        BaseResponse<Page<D>> dtos = service.getAll(params, pageable);
        return ResponseEntity.ok(dtos);
    }

    /**
     * API Lấy chi tiết thực thể theo ID
     * URL ví dụ: GET /api/users/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetails(@PathVariable("id") ID id) {
        BaseResponse<D> dto = service.getDetails(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * API Tạo mới thực thể
     * Sử dụng validation group Create.class để kiểm tra dữ liệu đầu vào.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody @Validated(BaseDto.Create.class) BaseRequest<D> dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    /**
     * API Cập nhật thực thể theo ID
     * Sử dụng validation group Update.class để kiểm tra dữ liệu.
     * Tự động gán ID từ URL vào DTO trước khi gửi xuống Service.
     */
    @PostMapping("/{id}")
    public ResponseEntity<?> update(@RequestBody @Validated(BaseDto.Update.class) BaseRequest<D> dto, @PathVariable("id") ID id) {
        dto.getData().setId(id);
        return ResponseEntity.ok(service.update(dto));
    }

    /**
     * API Xóa mềm một thực thể theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") ID id) {
        return ResponseEntity.ok(service.delete(id));
    }

    /**
     * API Xóa mềm hàng loạt danh sách thực thể theo danh sách ID
     */
    @DeleteMapping
    public ResponseEntity<?> deleteMany(@RequestBody List<ID> ids) {
        return ResponseEntity.ok(service.delete(ids));
    }
}