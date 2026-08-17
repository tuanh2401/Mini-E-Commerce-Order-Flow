package com.example.auth_service.repository;

import com.example.auth_service.entity.User;
import com.example.lib.repository.BaseRepository;

import java.util.Optional;

public interface UserRepository extends BaseRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByFacebookId(String facebookId);
    Optional<User> findByGoogleId(String googleId);
}
