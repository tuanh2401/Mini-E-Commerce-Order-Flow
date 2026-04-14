package com.example.lib.base;

import java.util.List;

/**
 * @param <Req> DTO Request (Ví dụ: ProductRequest)
 * @param <Res> DTO Response (Ví dụ: ProductResponse)
 * @param <ID>  Kiểu khoá chính (Ví dụ: Long, String)
 */
public interface BaseService<Req, Res, ID> {

    Res create(Req request);

    List<Res> getAll();

    Res getById(ID id);

    Res update(ID id, Req request);

    void delete(ID id);
}
