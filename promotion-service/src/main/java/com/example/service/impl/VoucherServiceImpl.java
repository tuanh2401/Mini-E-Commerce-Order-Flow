package com.example.service.impl;

import com.example.client.UserClient;
import com.example.dto.request.ValidateVoucherRequest;
import com.example.dto.response.VoucherResponse;
import com.example.entity.Voucher;
import com.example.lib.model.exception.BaseResourceNotFoundException;
import com.example.lib.model.exception.BusinessException;
import com.example.lib.service.BaseService;
import com.example.mapper.VoucherMapper;
import com.example.repository.VoucherRepository;
import com.example.service.VoucherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@Transactional
public class VoucherServiceImpl extends BaseService<VoucherRepository, VoucherResponse, Voucher, VoucherMapper, Long> implements VoucherService {

    @Autowired
    private UserClient userClient;

    public VoucherServiceImpl() {
    }

    /**
     * Kiểm tra tính hợp lệ của Voucher và tính toán số tiền được giảm giá.
     */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal validateAndCalculate(ValidateVoucherRequest request) {
        Voucher voucher = repository.findByCode(request.getCode().trim().toUpperCase())
                .orElseThrow(() -> new BaseResourceNotFoundException("error.voucher.not.found", new Object[]{request.getCode()}));

        // 1. Kiểm tra điều kiện chung
        validateVoucherConditions(voucher);

        // 2. Kiểm tra hạng thành viên
        if (voucher.getMinMembershipTier() != null && !voucher.getMinMembershipTier().trim().isEmpty()) {
            if (request.getUserId() == null) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Thiếu thông tin người dùng để áp dụng voucher này!", null);
            }
            try {
                // Gọi sang user-service lấy thông tin chi tiết của User
                var userResponse = userClient.getUserDetails(request.getUserId());
                if (userResponse == null || userResponse.getData() == null) {
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "Không tìm thấy thông tin thành viên!", null);
                }

                // Lấy giá trị membershipTier trong JSON trả về
                String userTier = (String) userResponse.getData().get("membershipTier");

                // So sánh trọng số thứ tự hạng thành viên
                if (getTierWeight(userTier) < getTierWeight(voucher.getMinMembershipTier())) {
                    throw new BusinessException(
                            HttpStatus.BAD_REQUEST,
                            "Cấp bậc thành viên không đủ để sử dụng voucher này! (Yêu cầu từ hạng " + voucher.getMinMembershipTier() + " trở lên)",
                            null
                    );
                }
            } catch (BusinessException e) {
                throw e; // Ném thẳng ra ngoài nếu là lỗi business được định nghĩa sẵn
            } catch (Exception e) {
                log.error("Lỗi khi kiểm tra hạng thành viên của UserID [{}]: {}", request.getUserId(), e.getMessage());
                throw new BusinessException(HttpStatus.BAD_REQUEST, "Không thể xác minh thứ hạng thành viên tại thời điểm này!", null);
            }
        }

        // 3. Kiểm tra giá trị đơn hàng tối thiểu
        if (request.getOrderTotalValue().compareTo(voucher.getMinOrderValue()) < 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.voucher.min.order.value", new Object[]{voucher.getMinOrderValue()});
        }

        // 4. Tính số tiền được giảm theo giá tiền cố định
        BigDecimal discount = voucher.getDiscountAmount();

        // Không được giảm quá giá trị đơn hàng
        if (discount.compareTo(request.getOrderTotalValue()) > 0) {
            discount = request.getOrderTotalValue();
        }

        // Giới hạn số tiền giảm tối đa (nếu có cấu hình)
        if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
            discount = voucher.getMaxDiscountAmount();
        }

        return discount;
    }

    /**
     * Áp dụng voucher khi tạo đơn hàng thành công (tăng số lượt sử dụng).
     */
    @Override
    @Transactional
    public void apply(String code) {
        Voucher voucher = repository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new BaseResourceNotFoundException("error.voucher.not.found", new Object[]{code}));

        validateVoucherConditions(voucher);

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        repository.save(voucher);
        log.info("Áp dụng mã voucher [{}] thành công. Số lượt dùng hiện tại: {}/{}", voucher.getCode(), voucher.getUsedCount(), voucher.getUsageLimit());
    }

    /**
     * Lấy danh sách các Voucher đang có hiệu lực.
     */
    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> activeVouchers = repository.findByIsActiveTrueAndValidFromBeforeAndValidToAfter(now, now);

        return activeVouchers.stream()
                .filter(voucher -> voucher.getUsedCount() < voucher.getUsageLimit())
                .map(mapper::toDto)
                .toList();
    }

    /**
     * Hàm phụ trợ kiểm tra điều kiện khả dụng của Voucher.
     */
    private void validateVoucherConditions(Voucher voucher) {
        if (voucher.getIsActive() == null || !voucher.getIsActive()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.voucher.inactive", null);
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(voucher.getValidFrom()) || now.isAfter(voucher.getValidTo())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.voucher.expired", null);
        }
        if (voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "error.voucher.limit.reached", null);
        }
    }
    private int getTierWeight(String tier) {
        if(tier == null) return 0;
        switch(tier.toUpperCase()) {
            case "BRONZE": return 0;
            case "SILVER": return 1;
            case "GOLD": return 2;
            case "PLATINUM": return 3;
            default: return 0;
        }
    }
    @Override
    @Transactional
    public void release(String code) {
        if (code == null || code.trim().isEmpty()) {
            return;
        }

        // 1. Tìm voucher theo mã
        Voucher voucher = repository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new BaseResourceNotFoundException("error.voucher.not.found", new Object[]{code}));

        // 2. Giảm số lượng đã dùng đi 1 (nếu hiện tại đang lớn hơn 0)
        if (voucher.getUsedCount() > 0) {
            voucher.setUsedCount(voucher.getUsedCount() - 1);
            repository.save(voucher);
            log.info("HOÀN VOUCHER THÀNH CÔNG: Mã [{}]. Lượt dùng mới: {}/{}",
                    voucher.getCode(), voucher.getUsedCount(), voucher.getUsageLimit());
        }
    }
}