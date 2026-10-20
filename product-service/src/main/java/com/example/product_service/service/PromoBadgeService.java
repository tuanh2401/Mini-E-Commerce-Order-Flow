package com.example.product_service.service;

import com.example.product_service.dto.response.PromoBadgeResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PromoBadgeService {
    List<PromoBadgeResponse> getActiveBadges();
    List<PromoBadgeResponse> getAllBadges();
    PromoBadgeResponse createBadge(MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active);
    PromoBadgeResponse updateBadge(Long id, MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active);
    PromoBadgeResponse toggleBadgeActive(Long id);
    void deleteBadge(Long id);
}
