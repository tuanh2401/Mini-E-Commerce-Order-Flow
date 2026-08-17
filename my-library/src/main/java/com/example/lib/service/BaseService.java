package com.example.lib.service;

import com.example.lib.i18n.MessageHelper;
import com.example.lib.mapper.EntityMapper;
import com.example.lib.model.dto.BaseDto;
import com.example.lib.model.entity.BaseEntity;
import com.example.lib.model.enums.BaseErrorCode;
import com.example.lib.model.request.BaseRequest;
import com.example.lib.model.response.BaseResponse;
import com.example.lib.repository.BaseRepository;
import com.example.lib.repository.BaseSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Triển khai mẫu generic lớp cha tầng Service.
 * Quản lý tự động các luồng dữ liệu map từ DTO sang Entity và ngược lại.
 */
public abstract class BaseService<
        R extends BaseRepository<E, ID>,
        D extends BaseDto<ID>,
        E extends BaseEntity<ID>,
        M extends EntityMapper<ID, D, E>,
        ID> implements IBaseService<R, D, E, M, ID> {

    @Autowired
    protected R repository;

    @Autowired
    protected M mapper;

    @Autowired
    protected MessageHelper messageHelper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<D> create(BaseRequest<D> dto) {
        try {
            if (isDuplicate(dto)) {
                String localizedMsg = messageHelper.getMessage("common.already_exists");
                return BaseResponse.fail(HttpStatus.BAD_REQUEST, localizedMsg);
            }
            E entity = mapper.toEntity(dto.getData());
            prepareEntityForCreate(entity);
            E saved = repository.save(entity);
            BaseResponse<D> response = new BaseResponse<>();
            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(saved));
            response.setMessage(getSuccessMessage("create"));
            return response;
        } catch (Exception ex) {
            throw wrapAsRuntime("create", ex);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<D> update(BaseRequest<D> dto) {
        try {
            ID id = dto.getData().getId();
            if (!repository.existsById(id)) {
                String localizedMsg = messageHelper.getMessage("common.not_found");
                return BaseResponse.fail(HttpStatus.BAD_REQUEST, localizedMsg);
            }
            if (isDuplicate(dto)) {
                String localizedMsg = messageHelper.getMessage("common.already_exists");
                return BaseResponse.fail(HttpStatus.BAD_REQUEST, localizedMsg);
            }
            Optional<E> result = repository.findEntityById(id);
            if (result.isPresent()) {
                E entity = result.get();
                // MapStruct tự động cập nhật các thay đổi vào Entity cũ mà không ghi đè null
                mapper.updateFromDTO(dto.getData(), entity);
                E updated = repository.save(entity);
                BaseResponse<D> response = new BaseResponse<>();
                response.setStatus(HttpStatus.OK);
                response.setData(mapper.toDto(updated));
                response.setMessage(getSuccessMessage("update"));
                return response;
            }
            return BaseResponse.fail(HttpStatus.BAD_REQUEST, messageHelper.getMessage("common.not_found"));
        } catch (Exception ex) {
            throw wrapAsRuntime("update", ex);
        }
    }

    @Override
    public BaseResponse<Page<D>> getAll(Map<String, String> params, Pageable pageable) {
        BaseResponse<Page<D>> responsePage = new BaseResponse<>();
        try {
            BaseSpecification<E> spec = new BaseSpecification<>(params);
            // Sắp xếp mặc định: Bản ghi mới chỉnh sửa hoặc mới tạo sẽ đưa lên đầu
            Sort sort = Sort.by(Sort.Direction.DESC, "lastModifiedDate", "createdDate");
            Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
            Page<E> result = repository.findAll(spec, sortedPageable);
            responsePage.setStatus(HttpStatus.OK);
            responsePage.setData(result.map(mapper::toDto));
            responsePage.setMessage(getSuccessMessage("get"));
        } catch (Exception ex) {
            responsePage.setStatus(HttpStatus.BAD_REQUEST);
            responsePage.setErrorCode(BaseErrorCode.FAILURE.getErrorCode());
            responsePage.setMessage(ex.getMessage());
        }
        return responsePage;
    }

    @Override
    public BaseResponse<D> getDetails(ID id) {
        BaseResponse<D> response = new BaseResponse<>();
        try {
            Optional<E> result = repository.findEntityById(id);
            if (result.isEmpty()) {
                response.setStatus(HttpStatus.NOT_FOUND);
                response.setMessage(messageHelper.getMessage("common.not_found"));
                return response;
            }
            response.setStatus(HttpStatus.OK);
            response.setData(mapper.toDto(result.get()));
            response.setMessage(getSuccessMessage("get"));
        } catch (Exception ex) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setErrorCode(BaseErrorCode.FAILURE.getErrorCode());
            response.setMessage(ex.getMessage());
        }
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<D> delete(ID id) {
        try {
            if (!repository.existsById(id)) {
                String localizedMsg = messageHelper.getMessage("common.not_found");
                return BaseResponse.fail(HttpStatus.BAD_REQUEST, localizedMsg);
            }
            // Gọi câu query xóa mềm ở repository
            repository.softDelete(id, LocalDateTime.now(), LocalDateTime.now());
            BaseResponse<D> response = new BaseResponse<>();
            response.setStatus(HttpStatus.OK);
            response.setMessage(getSuccessMessage("delete"));
            return response;
        } catch (Exception ex) {
            throw wrapAsRuntime("delete", ex);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BaseResponse<D> delete(List<ID> ids) {
        try {
            repository.softDelete(ids, LocalDateTime.now(), LocalDateTime.now());
            BaseResponse<D> response = new BaseResponse<>();
            response.setStatus(HttpStatus.OK);
            response.setMessage(getSuccessMessage("delete"));
            return response;
        } catch (Exception ex) {
            throw wrapAsRuntime("deleteMany", ex);
        }
    }

    protected String getSuccessMessage(String action, Object... args) {
        String entityName = mapper.getClass().getSimpleName().replace("MapperImpl", "").replace("Mapper", "").toLowerCase();
        String specificKey = "success." + entityName + "." + action;
        String genericKey = "success." + action;
        try {
            return messageHelper.getMessage(specificKey, args);
        } catch (Exception e) {
            try {
                return messageHelper.getMessage(genericKey, args);
            } catch (Exception ex) {
                return "Success";
            }
        }
    }

    private RuntimeException wrapAsRuntime(String action, Exception ex) {
        if (ex instanceof RuntimeException runtimeException) {
            return runtimeException;
        }
        return new RuntimeException("BaseService " + action + " failed", ex);
    }

    /**
     * Chuẩn hóa entity trước khi persist: bỏ id/version từ client (Swagger thường gửi id=0).
     */
    protected void prepareEntityForCreate(E entity) {
        entity.setId(null);
        entity.setVersion(null);
    }

    /**
     * Hàm kiểm tra trùng lặp nghiệp vụ. Lớp con có thể override hàm này nếu cần kiểm tra đặc thù.
     */
    protected boolean isDuplicate(BaseRequest<D> dto) {
        return false;
    }
}