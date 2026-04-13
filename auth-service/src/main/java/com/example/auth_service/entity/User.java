package com.example.auth_service.entity;

import jakarta.persistence.*;
import lombok.*;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true , nullable = false)
    private String username;
    @Column(nullable = false)
    private String password;
    private String email;
    @Enumerated(EnumType.STRING)
    private Role role;
}
