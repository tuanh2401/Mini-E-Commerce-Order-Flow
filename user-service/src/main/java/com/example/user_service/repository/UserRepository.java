package com.example.user_service.repository;
import com.example.lib.base.BaseRepository;
import com.example.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository

public interface UserRepository extends BaseRepository<User, Long> {
    //Spring data jpa tự tạo query: SELECT * FROM users where email = ?
    Optional<User> findByEmail(String email);

}
