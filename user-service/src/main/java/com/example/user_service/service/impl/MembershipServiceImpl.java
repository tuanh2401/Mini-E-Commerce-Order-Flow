package com.example.user_service.service.impl;

import com.example.lib.model.exception.BusinessException;
import com.example.user_service.entity.MembershipTier;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.MembershipService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipServiceImpl implements MembershipService {
    private final UserRepository userRepository;
    @Override
    @Transactional
    public void updateMembership(Long userId , BigDecimal orderAmount) {
        //Tìm user trong db
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND,"Không tìm thấy người dùng",null));
        //Đề phòng các th cũ db có gtri null
        BigDecimal currentSpent = user.getTotalSpent() != null ? user.getTotalSpent() : BigDecimal.ZERO;
        Integer currentOrders = user.getTotalOrders() != null ? user.getTotalOrders() : 0;
        //Tính toán giá trị mới
        BigDecimal newSpent = currentSpent.add(orderAmount);
        Integer newOrders = currentOrders + 1;
        user.setTotalSpent(newSpent);
        user.setTotalOrders(newOrders);
        //Logic xác định hạng thành viên mới
        MembershipTier newTier = calculateNewTier(newSpent , newOrders);
        if(user.getMembershipTier() != newTier){
            log.info("Chúc mừng User ID [{}] thăng hạng từ  [{}] lên [{}]",userId,user.getMembershipTier(),newTier);
            user.setMembershipTier(newTier);
        }
        //Lưu lại dtb
        userRepository.save(user);
        log.info("Cập nhật tích lũy hội viên thành công cho UserID [{}] , tổng chi tiêu : {} , tổng số đơn : {}",userId,newSpent,newOrders);
    }
    private MembershipTier calculateNewTier(BigDecimal spent, Integer orders){
        //Platinum : >= 30tr và >= 30 đơn
        if(spent.compareTo(new BigDecimal("30000000")) >= 0 && orders >= 30){
            return MembershipTier.PLATINUM;
        }
        if(spent.compareTo(new BigDecimal("10000000")) >= 0 && orders >= 15){
            return MembershipTier.GOLD;
        }
        if(spent.compareTo(new BigDecimal("2000000")) >= 0 && orders >= 5){
            return MembershipTier.SILVER;
        }
        return MembershipTier.BRONZE;
    }
}
