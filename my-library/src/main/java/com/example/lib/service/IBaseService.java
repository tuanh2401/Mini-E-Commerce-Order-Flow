package com.example.lib.service;

import com.example.lib.mapper.EntityMapper;
import com.example.lib.model.dto.BaseDto;
import com.example.lib.model.entity.BaseEntity;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.repository.BaseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Interface định nghĩa các phương thức nghiệp vụ CRUD cơ bản.
 * R: Repository của thực thể
 * D: DTO Response
 * E: Thực thể JPA
 * M: MapStruct Mapper của thực thể
 * ID: Kiểu khóa chính
 */
public interface IBaseService<
        R extends BaseRepository<E, ID>,
        D extends BaseDto<ID>,
        E extends BaseEntity<ID>,
        M extends EntityMapper<ID, D, E>,
        ID> {

    BaseResponse<D> create(BaseRequest<D> dto);

    BaseResponse<D> update(BaseRequest<D> dto);

    BaseResponse<Page<D>> getAll(Map<String, String> params, Pageable pageable);

    BaseResponse<D> getDetails(ID id);

    BaseResponse<D> delete(ID id);

    BaseResponse<D> delete(List<ID> ids);
}