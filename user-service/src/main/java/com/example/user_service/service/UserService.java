package com.example.user_service.service;

import com.example.user_service.dto.request.UpdateUserRequest;
import com.example.user_service.dto.response.UserResponse;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id, UpdateUserRequest request);
    UserResponse syncUser(com.example.user_service.dto.request.SyncUserRequest request);
}
