package com.example.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
}
