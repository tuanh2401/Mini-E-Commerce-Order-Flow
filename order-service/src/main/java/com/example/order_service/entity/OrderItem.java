package com.example.order_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name ="order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // sinh tự ộng id
    private Long id;
    @Column(name ="product_id")
    private Long productId;
    private int quantity;
    private BigDecimal price;
    //Móc nối về bảng order(khóa ngoại)
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}
