package com.example.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;

@Data
public class RoleRequest {
    @NotBlank(message = "Tên vai trò không đươc để trống")
    private String name; // vd : ROLE_STAFF
    private String description;
    private Set<Long> permissionIds; // danh sách ID các quyền muốn gán cho vai trò này
}
