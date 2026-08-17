package com.example.user_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse extends BaseDto<Long> {

    // Validate: Tên không được trống cho cả hành động Tạo mới và Cập nhật
    @NotBlank(message = "Tên không được để trống", groups = {Create.class, Update.class})
    private String fullName;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String email;

    private String phone;
    private String address;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String avatarUrl;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private BigDecimal totalSpent;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Integer totalOrders;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String membershipTier;
}