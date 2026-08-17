package com.example.user_service.service;

import java.math.BigDecimal;

public interface MembershipService {
    void updateMembership(Long userId , BigDecimal orderAmount);
}
