package com.example.order_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.lib.model.entity.BaseEntity;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Sinh tự động ID kiểu Long
    private Long id;

    @Column(name = "product_id")
    private Long productId;

    private int quantity;

    private BigDecimal price;

    // Móc nối về bảng Order (Khóa ngoại)
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính OrderItem.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính OrderItem.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}