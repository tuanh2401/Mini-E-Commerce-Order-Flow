package com.example.mapper;

import com.example.dto.response.VoucherResponse;
import com.example.entity.Voucher;
import com.example.lib.mapper.EntityMapper;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa Voucher Entity và VoucherResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface VoucherMapper extends EntityMapper<Long, VoucherResponse, Voucher> {
}