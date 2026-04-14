package com.example.user_service.service;
import com.example.lib.base.BaseService;
import com.example.user_service.dto.request.UpdateUserRequest;
import com.example.user_service.dto.response.UserResponse;

public interface UserService extends BaseService<UpdateUserRequest, UserResponse, Long> {
    // Chỉ giữ lại định nghĩa hàm Custom:
    UserResponse syncUser(com.example.user_service.dto.request.SyncUserRequest request);

    // (Xóa trắng toàn bộ các dòng getUserById, updateUser... ở dưới đi nhé)
}
