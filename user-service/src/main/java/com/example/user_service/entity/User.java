package com.example.user_service.entity;

import com.example.lib.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "users")
@Entity
@Builder
@SQLRestriction("deleted_at IS NULL")
public class User extends BaseEntity<Long> {

    @Id
    private Long id;

    @Column(nullable = false)
    private String fullname;

    private Integer age;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String address;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Builder.Default
    @Column(name = "total_spent", nullable = false)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_orders", nullable = false)
    private Integer totalOrders = 0;

    @Builder.Default
    @Column(name = "membership_tier", nullable = false)
    @Enumerated(EnumType.STRING)
    private MembershipTier membershipTier = MembershipTier.BRONZE;

    /**
     * Triển khai hàm getId() từ lớp cha BaseEntity để lấy khóa chính.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Triển khai hàm setId() từ lớp cha BaseEntity để gán khóa chính.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}