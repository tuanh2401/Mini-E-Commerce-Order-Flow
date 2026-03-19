package com.example.order_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID) //Dng IIOD ( chuoi random) làm ID tránh bị dò mã
    private String id;

    @Column(name = "user_id")
    private Long userId;
    @Column(name = "total_price")
    private BigDecimal totalPrice;
    private String status;
    @Column(name ="created_at")
    private LocalDateTime createdAt;
    private String address;
    @Column(name ="payment_method")
    private String paymentMethod;
   // 1 đơn hàng có th có nhiều mặt hàng bên trong
    @OneToMany(mappedBy = "order" , cascade = CascadeType.ALL)
    private List<OrderItem> items;
}
