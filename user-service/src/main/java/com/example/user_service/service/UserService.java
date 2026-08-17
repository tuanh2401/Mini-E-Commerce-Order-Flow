package com.example.user_service.service;

import com.example.lib.service.IBaseService;
import com.example.user_service.dto.request.SyncUserRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.entity.User;
import com.example.user_service.mapper.UserMapper;
import com.example.user_service.repository.UserRepository;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interface nghiệp vụ User kế thừa từ IBaseService dùng chung.
 */
public interface UserService extends IBaseService<UserRepository, UserResponse, User, UserMapper, Long> {

    UserResponse syncUser(SyncUserRequest request);

    UserResponse uploadUserAvatar(Long id, MultipartFile file);

    com.example.lib.model.response.BaseResponse<UserResponse> updateMyProfile(UserResponse dto);
}