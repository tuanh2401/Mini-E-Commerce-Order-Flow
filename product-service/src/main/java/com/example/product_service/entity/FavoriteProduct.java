package com.example.product_service.entity;

import com.example.lib.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "favorite_products", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLRestriction("deleted_at IS NULL")
public class FavoriteProduct extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false)
    private String userId;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính FavoriteProduct.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính FavoriteProduct.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}