package com.example.product_service.dto.response;

import com.example.lib.model.dto.BaseDto;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse extends BaseDto<Long> {
    // userId được server tự động lấy từ JWT token, client KHÔNG cần gửi lên
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = Access.READ_ONLY)
    private String userId;

    // Validate: Điểm đánh giá (Rating) bắt buộc từ 1 đến 5 sao
    @NotNull(message = "Điểm đánh giá không được để trống", groups = {Create.class, Update.class})
    @Min(value = 1, message = "Điểm đánh giá tối thiểu phải bằng 1", groups = {Create.class, Update.class})
    @Max(value = 5, message = "Điểm đánh giá tối đa phải bằng 5", groups = {Create.class, Update.class})
    private Integer rating;

    private String comment;

    // Validate: ID sản phẩm được đánh giá không được trống
    @NotNull(message = "productId không được để trống", groups = {Create.class, Update.class})
    private Long productId;
}