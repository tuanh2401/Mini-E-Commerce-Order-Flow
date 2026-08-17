package com.example.lib.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@SQLRestriction("deleted_at IS NULL")
public abstract class BaseEntity<ID> implements Serializable {

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    // Người tạo (Kiểu String - Lưu username của Auditor)
    @CreatedBy
    @Column(name = "created_by", length = 50, updatable = false)
    private String createdBy;

    // Ngày tạo (Kiểu LocalDateTime)
    @CreatedDate
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    // Người sửa cuối
    @LastModifiedBy
    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    // Ngày sửa cuối
    @LastModifiedDate
    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate = LocalDateTime.now();

    // Thời gian xóa mềm (nếu có)
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Lớp con sẽ triển khai hàm này để trả về trường ID tương ứng
    public abstract ID getId();

    // Lớp con sẽ triển khai hàm này để gán ID
    public abstract void setId(ID id);
}