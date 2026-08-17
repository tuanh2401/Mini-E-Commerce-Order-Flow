package com.example.auth_service.controller;

import com.example.auth_service.dto.request.PermissionRequest;
import com.example.auth_service.dto.request.RoleRequest;
import com.example.auth_service.entity.Permission;
import com.example.auth_service.entity.Role;
import com.example.auth_service.service.AuthService;
import com.example.lib.model.response.BaseResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRolePermissionController {
    private final AuthService authService;
    public AdminRolePermissionController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/permissions")
    public ResponseEntity<BaseResponse<Permission>> createPermission(@Valid @RequestBody PermissionRequest request) {
        Permission permission = authService.createPermission(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.CREATED, permission));
    }
    @PostMapping("/roles")
    public ResponseEntity<BaseResponse<Role>> createRole(@Valid @RequestBody RoleRequest request) {
        Role role = authService.createRole(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.CREATED, role));
    }
}
