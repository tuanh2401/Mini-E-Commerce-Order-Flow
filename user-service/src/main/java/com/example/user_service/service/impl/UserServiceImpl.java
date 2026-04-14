package com.example.user_service.service.impl;
import com.example.lib.base.AbstractBaseService;
import com.example.user_service.dto.request.UpdateUserRequest;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.entity.User;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import org.springframework.stereotype.Service;


@Service
// Sửa dòng cũ thành dòng này nhé:
public class UserServiceImpl extends AbstractBaseService<User, UpdateUserRequest, UserResponse, Long> implements UserService {

    private final UserRepository userRepository;
    public UserServiceImpl(UserRepository userRepository) {
        super(userRepository);
        this.userRepository = userRepository;
    }
    @Override
    protected User mapToEntity(UpdateUserRequest request, User entity) {
        // NẾU là TẠO MỚI (Lệnh này base yêu cầu phòng hờ dù User Service ít xài)
        if (entity == null) {
            return User.builder()
                    .fullname(request.getFullName())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .build();
        }

        // NẾU LÀ CẬP NHẬT:
        entity.setFullname(request.getFullName());

        // Đoạn check trùng Email cũ của bạn
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().equals(entity.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email đã được sử dụng bởi người dùng khác");
            }
            entity.setEmail(request.getEmail());
        }

        entity.setPhone(request.getPhone());
        entity.setAddress(request.getAddress());
        return entity;
    }

    @Override
    protected UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullname())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .build();
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


}
