package com.example.service;

import com.example.dto.request.ValidateVoucherRequest;
import com.example.dto.response.VoucherResponse;
import com.example.entity.Voucher;
import com.example.mapper.VoucherMapper;
import com.example.repository.VoucherRepository;
import com.example.lib.service.IBaseService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

/**
 * Interface nghiệp vụ Voucher kế thừa IBaseService generic.
 */
public interface VoucherService extends IBaseService<VoucherRepository, VoucherResponse, Voucher, VoucherMapper, Long> {

    // 1. Kiểm tra tính hợp lệ của Voucher và tính toán số tiền được giảm giá
    BigDecimal validateAndCalculate(ValidateVoucherRequest request);

    // 2. Áp dụng voucher (tăng số lượt đã sử dụng)
    void apply(String code);

    // 3. Lấy danh sách Voucher đang còn hiệu lực
    List<VoucherResponse> getActiveVouchers();

    void release(String code);
}