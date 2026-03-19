package com.example.user_service.service.impl;

import com.example.user_service.dto.request.UpdateUserRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.entity.User;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
        return mapToResponse(user);
    }

    @Override
    public UserResponse syncUser(com.example.user_service.dto.request.SyncUserRequest request) {
        // Kiểm tra xem User đã tồn tại chưa (đề phòng gọi lặp)
        if (userRepository.existsById(request.getId())) {
             return mapToResponse(userRepository.findById(request.getId()).get());
        }

        User user = User.builder()
                .id(request.getId())
                .fullname(request.getUsername()) // Tạm thời lấy username làm fullname
                .email(request.getEmail())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng để cập nhật ID: " + id));

        // Cập nhật thông tin từ request
        user.setFullname(request.getFullName());
        
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng bởi người dùng khác");
            }
            user.setEmail(request.getEmail());
        }

        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    // Helper method để map từ Entity sang DTO
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
    }
}
