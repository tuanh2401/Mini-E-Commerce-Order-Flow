package com.example.auth_service.controller;

import com.example.auth_service.dto.request.*;
import com.example.auth_service.dto.response.AuthResponse;
import com.example.auth_service.dto.response.FindAccountResponse;
import com.example.auth_service.dto.response.ForgotPasswordResponse;
import com.example.auth_service.service.AuthService;
import com.example.auth_service.service.SocialAuthService;
import com.example.lib.model.exception.BusinessException;
import com.example.lib.model.response.BaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SocialAuthService socialAuthService;

    /**
     * Đăng nhập người dùng
     * URL: POST /api/auth/authenticate
     */
    @PostMapping("/authenticate")
    public ResponseEntity<BaseResponse<AuthResponse>> authenticate(@Valid @RequestBody LoginRequest request) {
        log.info("Yêu cầu login từ User: {}", request.getUsername());
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * Đăng ký tài khoản mới (cần được verify qua email)
     * URL: POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<BaseResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Nhận yêu cầu đăng ký tài khoản mới cho username: {}", request.getUsername());
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * Xác thực tài khoản đăng ký mới qua link email
     * URL: GET /api/auth/verify
     */
    @GetMapping("/verify")
    public ResponseEntity<BaseResponse<AuthResponse>> verify(@RequestParam("token") String token) {
        log.info("Nhận yêu cầu xác thực token cho: {}", token);
        AuthResponse response = authService.verifyByToken(token);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * Từ chối/hủy yêu cầu đăng ký tài khoản
     * URL: GET /api/auth/reject
     */
    @GetMapping("/reject")
    public ResponseEntity<BaseResponse<Void>> reject(@RequestParam("token") String token) {
        log.info("Nhận yêu cầu reject với token cho: {}", token);
        authService.rejectRegistration(token);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }

    /**
     * Tạo tài khoản Admin để test
     * URL: POST /api/auth/register-admin
     */
    @PostMapping("/register-admin")
    public ResponseEntity<BaseResponse<AuthResponse>> registerAdmin(@Valid @RequestBody RegisterRequest request) {
        log.info("Nhận yêu cầu tạo tài khoản admin để test: {}", request.getUsername());
        AuthResponse response = authService.registerAdmin(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }
    /**
     * Tạo tài khoản Nhân viên (Staff / Shipper)
     * URL: POST /api/auth/register-staff
     */
    @PostMapping("/register-staff")
    public ResponseEntity<BaseResponse<AuthResponse>> registerStaff(
            @RequestHeader(value = "X-User-Role", required = false) String roleHeader,
            @Valid @RequestBody RegisterRequest request) {
        log.info("Yêu cầu tạo nhân viên mới từ role [{}]: {}", roleHeader, request.getUsername());
        if (roleHeader == null || (!roleHeader.equalsIgnoreCase("ADMIN") && !roleHeader.equalsIgnoreCase("ROLE_ADMIN"))) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện thao tác này! Chỉ Quản trị viên mới được tạo tài khoản nhân viên.", null);
        }
        AuthResponse response = authService.registerStaff(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }
    /**
     * Lấy Access Token mới từ Refresh Token
     * URL: POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<BaseResponse<AuthResponse>> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        log.info("Nhận yêu cầu refresh token");
        AuthResponse response = authService.refreshAccessToken(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * Đăng xuất tài khoản (Xóa Refresh Token)
     * URL: POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(@Valid @RequestBody TokenRefreshRequest request) {
        log.info("Nhận yêu cầu đăng xuất");
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }

    @DeleteMapping("/internal/users/{id}")
    public ResponseEntity<BaseResponse<Void>> disableUserInternal(@PathVariable("id") Long userId) {
        authService.disableAndBlackListUser(userId);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }

    /**
     * Đăng nhập/Đăng ký nhanh qua Google/Facebook
     * URL: POST /api/auth/social-login
     */
    @PostMapping("/social-login")
    public ResponseEntity<BaseResponse<AuthResponse>> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        log.info("Nhận yêu cầu đăng nhập qua mạng xã hội: {}", request.getProvider());
        AuthResponse response = socialAuthService.loginWithSocial(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * Hoàn thiện đăng ký tài khoản cho login mạng xã hội lần đầu
     * URL: POST /api/auth/social-register
     */
    @PostMapping("/social-register")
    public ResponseEntity<BaseResponse<AuthResponse>> socialRegister(@Valid @RequestBody SocialRegisterRequest request) {
        log.info("Nhận yêu cầu hoàn thiện đăng ký mạng xã hội cho username: {}", request.getUsername());
        AuthResponse response = socialAuthService.registerWithSocial(request);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, response));
    }

    /**
     * Bước 1 Quên mật khẩu: Nhập tên tài khoản (Username) -> Gửi OTP về Email và trả về Email đã mask
     * URL: POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<BaseResponse<com.example.auth_service.dto.response.ForgotPasswordResponse>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse data = authService.forgotPassword(request);
        BaseResponse<com.example.auth_service.dto.response.ForgotPasswordResponse> response = new BaseResponse<>();
        response.setStatus(HttpStatus.OK);
        response.setData(data);
        response.setMessage(data.getMessage());
        return ResponseEntity.ok(response);
    }

    /**
     * Bước 2 Quên mật khẩu: Nhập OTP và Mật khẩu mới
     * URL: POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<BaseResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        BaseResponse<String> response = new BaseResponse<>();
        response.setStatus(HttpStatus.OK);
        response.setMessage("Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.");
        return ResponseEntity.ok(response);
    }

    /**
     * Quên tên tài khoản: Nhập Email hoặc Số điện thoại để tìm lại Username
     * URL: POST /api/auth/find-account
     */
    @PostMapping("/find-account")
    public ResponseEntity<BaseResponse<com.example.auth_service.dto.response.FindAccountResponse>> findAccount(@Valid @RequestBody com.example.auth_service.dto.request.FindAccountRequest request) {
        FindAccountResponse data = authService.findAccount(request);
        BaseResponse<com.example.auth_service.dto.response.FindAccountResponse> response = new BaseResponse<>();
        response.setStatus(HttpStatus.OK);
        response.setData(data);
        response.setMessage("Đã tìm thấy tài khoản của bạn!");
        return ResponseEntity.ok(response);
    }

    /**
     * API nội bộ: Cập nhật Email đồng bộ từ User-Service sang Auth-Service
     * URL: PUT /api/auth/internal/users/{id}/email
     */
    @PutMapping("/internal/users/{id}/email")
    public ResponseEntity<BaseResponse<Void>> updateEmailInternal(
            @PathVariable("id") Long userId,
            @RequestParam("email") String email) {
        authService.updateEmailInternal(userId, email);
        return ResponseEntity.ok(BaseResponse.success(HttpStatus.OK, null));
    }
}