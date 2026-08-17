package com.example.auth_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.example.lib.model.entity.BaseEntity;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("deleted_at IS NULL")
public class User extends BaseEntity<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String fullname;

    @Column(nullable = true)
    @Min(value = 1, message = "Tuổi phải lớn hơn 0")
    @Max(value = 150, message = "Tuổi không hợp lệ")
    private Integer age;

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(unique = true)
    private String verificationToken;

    private LocalDateTime expiryTime;

    private String password;

    @Column(nullable = false)
    private String email;

    @Column(name = "facebook_id", unique = true)
    private String facebookId;

    @Column(name = "google_id", unique = true)
    private String googleId;

    private String phone;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    /**
     * Ghi đè hàm getId() từ lớp cha BaseEntity để lấy khóa chính User.
     */
    @Override
    public Long getId() {
        return this.id;
    }

    /**
     * Ghi đè hàm setId() từ lớp cha BaseEntity để gán khóa chính User.
     */
    @Override
    public void setId(Long id) {
        this.id = id;
    }
}