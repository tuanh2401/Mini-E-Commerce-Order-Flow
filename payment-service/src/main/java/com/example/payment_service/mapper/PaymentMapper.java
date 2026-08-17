package com.example.payment_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.payment_service.dto.response.PaymentResponse;
import com.example.payment_service.entity.Payment;
import org.mapstruct.Mapper;

/**
 * Interface Mapper chuyển đổi tự động giữa Payment Entity và PaymentResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface PaymentMapper extends EntityMapper<String, PaymentResponse, Payment> {
}