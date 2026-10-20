package com.example.product_service.service.impl;

import com.example.lib.service.MinioService;
import com.example.product_service.dto.response.PromoBadgeResponse;
import com.example.product_service.entity.PromoBadge;
import com.example.product_service.repository.PromoBadgeRepository;
import com.example.product_service.service.PromoBadgeService;
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
public class PromoBadgeServiceImpl implements PromoBadgeService {

    private final PromoBadgeRepository promoBadgeRepository;
    private final MinioService minioService;

    @Override
    @Transactional(readOnly = true)
    public List<PromoBadgeResponse> getActiveBadges() {
        return promoBadgeRepository.findByActiveTrueOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromoBadgeResponse> getAllBadges() {
        return promoBadgeRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PromoBadgeResponse createBadge(MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active) {
        log.info("Bắt đầu tải ảnh badge lên MinIO: tiêu đề = {}", title);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn file hình ảnh cho badge!");
        }

        String iconUrl = minioService.uploadFile(file, "badges");
        log.info("Upload badge icon lên MinIO thành công: {}", iconUrl);

        PromoBadge badge = PromoBadge.builder()
                .title(title)
                .iconUrl(iconUrl)
                .linkUrl(linkUrl != null ? linkUrl : "")
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .active(active != null ? active : true)
                .build();

        PromoBadge saved = promoBadgeRepository.save(badge);
        return toDto(saved);
    }

    @Override
    public PromoBadgeResponse updateBadge(Long id, MultipartFile file, String title, String linkUrl, Integer displayOrder, Boolean active) {
        PromoBadge badge = promoBadgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy badge với ID: " + id));

        if (file != null && !file.isEmpty()) {
            String oldUrl = badge.getIconUrl();
            String newUrl = minioService.uploadFile(file, "badges");
            badge.setIconUrl(newUrl);

            try {
                if (oldUrl != null && oldUrl.contains("/badges/")) {
                    minioService.deleteFile(oldUrl);
                }
            } catch (Exception e) {
                log.warn("Lỗi khi xóa ảnh badge cũ trên MinIO: {}", e.getMessage());
            }
        }

        if (title != null) badge.setTitle(title);
        if (linkUrl != null) badge.setLinkUrl(linkUrl);
        if (displayOrder != null) badge.setDisplayOrder(displayOrder);
        if (active != null) badge.setActive(active);

        PromoBadge updated = promoBadgeRepository.save(badge);
        return toDto(updated);
    }

    @Override
    public PromoBadgeResponse toggleBadgeActive(Long id) {
        PromoBadge badge = promoBadgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy badge với ID: " + id));

        badge.setActive(!Boolean.TRUE.equals(badge.getActive()));
        PromoBadge updated = promoBadgeRepository.save(badge);
        return toDto(updated);
    }

    @Override
    public void deleteBadge(Long id) {
        PromoBadge badge = promoBadgeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy badge với ID: " + id));

        try {
            if (badge.getIconUrl() != null && badge.getIconUrl().contains("/badges/")) {
                minioService.deleteFile(badge.getIconUrl());
            }
        } catch (Exception e) {
            log.warn("Lỗi xóa file badge trên MinIO: {}", e.getMessage());
        }

        badge.setDeletedAt(LocalDateTime.now());
        promoBadgeRepository.save(badge);
        log.info("Đã xóa mềm badge ID: {}", id);
    }

    private PromoBadgeResponse toDto(PromoBadge entity) {
        return PromoBadgeResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .iconUrl(entity.getIconUrl())
                .linkUrl(entity.getLinkUrl())
                .displayOrder(entity.getDisplayOrder())
                .active(entity.getActive())
                .createdDate(entity.getCreatedDate())
                .lastModifiedDate(entity.getLastModifiedDate())
                .build();
    }
}
