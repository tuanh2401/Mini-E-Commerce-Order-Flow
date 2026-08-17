package com.example.product_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse extends BaseDto<Long> {

    // Validate: Tên danh mục bắt buộc phải có cho cả Tạo mới và Cập nhật
    @NotBlank(message = "Tên danh mục không được để trống", groups = {Create.class, Update.class})
    private String name;

    private String description;
}