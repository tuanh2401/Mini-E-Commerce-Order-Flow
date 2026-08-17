package com.example.cart_service.entity;

import com.example.lib.model.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carts")
public class Cart extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true)
    private Long userId;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = false)
    @SQLRestriction("deleted_at IS NULL") //tự lọc bỏ các item đã bị xóa mềm
    private List<CartItem> items = new ArrayList<>();

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính Cart.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính Cart.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}