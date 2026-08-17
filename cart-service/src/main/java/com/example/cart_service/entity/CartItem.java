package com.example.cart_service.entity;

import com.example.lib.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "cart_items")
public class CartItem extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính CartItem.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính CartItem.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}