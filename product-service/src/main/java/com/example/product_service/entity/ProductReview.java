package com.example.product_service.entity;

import com.example.lib.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLRestriction("deleted_at IS NULL")
public class ProductReview extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính ProductReview.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính ProductReview.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}