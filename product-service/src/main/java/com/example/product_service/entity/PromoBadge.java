package com.example.product_service.entity;

import com.example.lib.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promo_badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromoBadge extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "icon_url", nullable = false)
    private String iconUrl;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Override
    public Long getId() {
        return this.id;
    }

    @Override
    public void setId(Long id) {
        this.id = id;
    }
}
