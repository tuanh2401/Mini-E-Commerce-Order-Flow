package com.example.product_service.service;

import com.example.product_service.dto.response.BannerResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BannerService {
    List<BannerResponse> getActiveBanners();
    List<BannerResponse> getAllBanners();
    BannerResponse createBanner(MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active);
    BannerResponse updateBanner(Long id, MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active);
    BannerResponse toggleBannerActive(Long id);
    void deleteBanner(Long id);
}
