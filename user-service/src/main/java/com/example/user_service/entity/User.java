package com.example.user_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;



@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "users")
@Entity
@Builder
public class User {
    @Id
    private long id;
    @Column(nullable = false)
    private String fullname;
    @Column(unique = true, nullable = false)
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
}
