package com.example.repository;

import com.example.entity.Voucher;
import com.example.lib.repository.BaseRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends BaseRepository<Voucher, Long> {

    // Tìm kiếm Voucher theo mã code
    Optional<Voucher> findByCode(String code);

    // Tìm danh sách Voucher đang kích hoạt và nằm trong thời gian sử dụng
    List<Voucher> findByIsActiveTrueAndValidFromBeforeAndValidToAfter(LocalDateTime validFrom, LocalDateTime validTo);

    // Đếm số lượng voucher đang kích hoạt
    long countByIsActiveTrue();

    // Đếm số lượng voucher ngưng kích hoạt
    long countByIsActiveFalse();
}