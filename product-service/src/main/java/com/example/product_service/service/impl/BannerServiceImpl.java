package com.example.product_service.service.impl;

import com.example.lib.service.MinioService;
import com.example.product_service.dto.response.BannerResponse;
import com.example.product_service.entity.Banner;
import com.example.product_service.repository.BannerRepository;
import com.example.product_service.service.BannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final MinioService minioService;

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        return bannerRepository.findByActiveTrueOrderByDisplayOrderAscIdDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAscIdDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BannerResponse createBanner(MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active) {
        log.info("Bắt đầu tải ảnh banner lên MinIO");
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn file ảnh banner!");
        }

        String imageUrl = minioService.uploadFile(file, "banners");
        log.info("Upload banner lên MinIO thành công: {}", imageUrl);

        Banner banner = Banner.builder()
                .title(title)
                .imageUrl(imageUrl)
                .linkUrl(linkUrl != null ? linkUrl : "")
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .active(active != null ? active : true)
                .build();

        Banner saved = bannerRepository.save(banner);
        return toDto(saved);
    }

    @Override
    public BannerResponse updateBanner(Long id, MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner với ID: " + id));

        if (file != null && !file.isEmpty()) {
            String oldUrl = banner.getImageUrl();
            String newUrl = minioService.uploadFile(file, "banners");
            banner.setImageUrl(newUrl);

            try {
                if (oldUrl != null && oldUrl.contains("/banners/")) {
                    minioService.deleteFile(oldUrl);
                }
            } catch (Exception e) {
                log.warn("Lỗi khi xóa ảnh banner cũ trên MinIO: {}", e.getMessage());
            }
        }

        if (title != null) banner.setTitle(title);
        if (linkUrl != null) banner.setLinkUrl(linkUrl);
        if (displayOrder != null) banner.setDisplayOrder(displayOrder);
        if (active != null) banner.setActive(active);

        Banner updated = bannerRepository.save(banner);
        return toDto(updated);
    }

    @Override
    public BannerResponse toggleBannerActive(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner với ID: " + id));

        banner.setActive(!Boolean.TRUE.equals(banner.getActive()));
        Banner updated = bannerRepository.save(banner);
        return toDto(updated);
    }

    @Override
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy banner với ID: " + id));

        try {
            if (banner.getImageUrl() != null && banner.getImageUrl().contains("/banners/")) {
                minioService.deleteFile(banner.getImageUrl());
            }
        } catch (Exception e) {
            log.warn("Lỗi xóa file trên MinIO: {}", e.getMessage());
        }

        banner.setDeletedAt(LocalDateTime.now());
        bannerRepository.save(banner);
        log.info("Đã xóa mềm banner ID: {}", id);
    }

    private BannerResponse toDto(Banner entity) {
        return BannerResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .imageUrl(entity.getImageUrl())
                .linkUrl(entity.getLinkUrl())
                .displayOrder(entity.getDisplayOrder())
                .active(entity.getActive())
                .createdDate(entity.getCreatedDate())
                .lastModifiedDate(entity.getLastModifiedDate())
                .build();
    }
}
