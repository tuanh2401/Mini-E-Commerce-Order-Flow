package com.example.user_service.controller;

import com.example.lib.controller.BaseController;
import com.example.lib.model.response.BaseResponse;
import com.example.user_service.dto.request.SyncUserRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.service.UserService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/users")
// Kế thừa BaseController: Tự động cung cấp các API CRUD cơ bản cho User
public class UserController extends BaseController<UserService, UserResponse, Long> {

    // 1. XEM thông tin cá nhân của chính mình (Tận dụng lại hàm getDetails có sẵn)
    @GetMapping("/me")
    @PreAuthorize("@ss.hasPermission('USER_VIEW')")
    public ResponseEntity<BaseResponse<UserResponse>> getMyProfile(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId) {
        log.info("User [{}] đang truy cập để xem thông tin cá nhân", userId);
        BaseResponse<UserResponse> data = service.getDetails(userId);
        return ResponseEntity.ok(data);
    }

    // 2. CẬP NHẬT thông tin cá nhân của chính mình (Tận dụng lại hàm update có sẵn)
    @PutMapping("/me")
    @PreAuthorize("@ss.hasPermission('USER_VIEW')")
    public ResponseEntity<BaseResponse<UserResponse>> updateMyProfile(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId,
            @Valid @RequestBody UserResponse request) {
        log.info("User [{}] đang yêu cầu cập nhật thông tin. Tên mới: {}", userId, request.getFullName());

        // Gán userId từ header vào request DTO
        request.setId(userId);

        BaseResponse<UserResponse> response = service.updateMyProfile(request);
        log.info("Cập nhật thành công thông tin cho User [{}]", userId);
        return ResponseEntity.ok(response);
    }

    // 3. API dành riêng cho Nội bộ (Feign Client từ các service khác gọi sang)
    @GetMapping("/internal/{id}")
    public ResponseEntity<BaseResponse<UserResponse>> getUserByIdInternal(
            @PathVariable Long id,
            @RequestHeader(value = "X-Internal-Service", required = false) String serviceName) {
        String caller = (serviceName != null) ? serviceName : "Unknown Service";
        log.info("[Bảo mật nội bộ] Service [{}] đang truy vấn thông tin User ID: {}", caller, id);

        BaseResponse<UserResponse> data = service.getDetails(id);

        log.info("[Bảo mật nội bộ] Trả về thông tin User ID [{}] cho Service [{}] thành công.", id, caller);
        return ResponseEntity.ok(data);
    }

    // 4. Đồng bộ hóa User Profile từ Auth Service
    @PostMapping("/internal/sync")
    public ResponseEntity<BaseResponse<UserResponse>> syncUser(@RequestBody SyncUserRequest request) {
        log.info("Nhận yêu cầu đồng bộ User Profile cho ID: {}", request.getId());
        UserResponse data = service.syncUser(request);
        log.info("Hoàn tất đồng bộ User Profile cho ID: {}. Trạng thái: SUCCESS", request.getId());
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, data));
    }

    // 5. Tải ảnh đại diện (avatar) lên hệ thống
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@ss.hasPermission('USER_VIEW')")
    public ResponseEntity<BaseResponse<UserResponse>> updateUserAvatar(
            @Parameter(hidden = true) @RequestHeader("userId") Long userId,
            @RequestParam("file") MultipartFile file) {
        log.info("User [{}] yêu cầu tải lên ảnh đại diện mới", userId);
        UserResponse response = service.uploadUserAvatar(userId, file);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }
}