package com.example.product_service.repository;

import com.example.product_service.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p from Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(Long id);
}
