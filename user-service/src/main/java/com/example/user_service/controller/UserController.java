package com.example.user_service.controller;

import com.example.user_service.dto.request.UpdateUserRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 1. XEM thông tin cá nhân của chính mình
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(@RequestHeader("userId") Long userId) {
        // Sửa lại: Dùng log xem thông tin, không dùng request
        log.info("User [{}] đang truy cập để xem thông tin cá nhân", userId);

        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // 2. CẬP NHẬT thông tin cá nhân của chính mình
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMyProfile(
            @RequestHeader("userId") Long userId,
            @Valid @RequestBody UpdateUserRequest request) {
        // Chuyển log cập nhật xuống đúng hàm PUT này
        log.info("User [{}] đang yêu cầu CẬP NHẬT thông tin. Tên mới: {}", userId, request.getFullName());

        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    // 3. Lấy thông tin User theo ID (Dùng cho Admin hoặc các service khác gọi nội bộ)
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.info("Hệ thống đang truy vấn thông tin của User ID: {}", id);
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // 4. Cập nhật User bất kỳ (Dùng cho Admin)
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        log.info("Admin đang cập nhật thông tin cho User ID: {}", id);
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // 5. API ĐỒNG BỘ NỘI BỘ (Gọi từ Auth Service)
    @PostMapping("/sync")
    public ResponseEntity<UserResponse> syncUser(@RequestBody com.example.user_service.dto.request.SyncUserRequest request) {
        log.info("Nhận yêu cầu đồng bộ User Profile cho ID: {}", request.getId());
        return ResponseEntity.ok(userService.syncUser(request));
    }
}
