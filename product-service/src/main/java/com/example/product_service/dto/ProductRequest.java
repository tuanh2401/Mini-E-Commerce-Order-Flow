package com.example.product_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;
    private String description;
    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá sản phẩm không được là số âm")
    private BigDecimal price;
    private Integer stock;
}
