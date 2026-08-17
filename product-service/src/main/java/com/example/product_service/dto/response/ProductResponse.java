package com.example.product_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse extends BaseDto<Long> {

    // Validate: Tên sản phẩm bắt buộc phải có cho cả tạo mới và cập nhật
    @NotBlank(message = "Tên sản phẩm không được để trống", groups = {Create.class, Update.class})
    private String name;

    private String description;

    // Validate: Giá tiền bắt buộc và phải là số dương
    @NotNull(message = "Giá sản phẩm không được để trống", groups = {Create.class, Update.class})
    @Positive(message = "Giá sản phẩm phải là số dương lớn hơn 0", groups = {Create.class, Update.class})
    private BigDecimal price;

    // Validate: Số lượng tồn kho bắt buộc và không được âm (tối thiểu bằng 0)
    @NotNull(message = "Số lượng tồn kho không được để trống", groups = {Create.class, Update.class})
    @Min(value = 0, message = "Số lượng tồn kho tối thiểu phải bằng 0", groups = {Create.class, Update.class})
    private Integer stock;

    private String imageUrl;

    @NotNull(message = "Danh mục sản phẩm không được để trống", groups = {Create.class, Update.class})
    @Positive(message = "ID danh mục phải là số dương", groups = {Create.class, Update.class})
    private Long categoryId;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String categoryName;
}