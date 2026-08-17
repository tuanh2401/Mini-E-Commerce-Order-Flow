package com.example.order_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import com.example.lib.model.entity.BaseEntity;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order extends BaseEntity<String> {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Dùng UUID (String) làm ID tránh bị dò mã đơn hàng
    private String id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    private String status;

    private String address;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    // 1 đơn hàng có thể có nhiều mặt hàng bên trong
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính Order.
     */
    @Override
    public String getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính Order.
     */
    @Override
    public void setId(String id) {
        this.id = id;
    }
}