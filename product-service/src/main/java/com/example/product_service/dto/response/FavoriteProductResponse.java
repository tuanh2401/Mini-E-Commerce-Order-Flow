package com.example.product_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteProductResponse extends BaseDto<Long> {

    // Validate: ID của User yêu thích không được để trống
    @NotBlank(message = "userId không được để trống", groups = {Create.class, Update.class})
    private String userId;

    // Validate: ID của sản phẩm yêu thích không được để trống
    @NotNull(message = "productId không được để trống", groups = {Create.class, Update.class})
    private Long productId;

    // Đính kèm chi tiết sản phẩm (nếu muốn trả về chi tiết sản phẩm yêu thích)
    private ProductResponse product;
}