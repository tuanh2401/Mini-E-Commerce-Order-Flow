package com.example.lib.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
//Interface cha của DTO , chứa các Validation
@Data
@AllArgsConstructor
@NoArgsConstructor
public abstract class BaseDto<I> {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @Null(groups = Create.class)
    @NotNull(groups = Nested.class)
    @Positive(groups = Nested.class)
    private I id;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty("createdAt")
    private LocalDateTime createdDate;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty("updatedAt")
    private LocalDateTime lastModifiedDate;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String createdBy;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private String lastModifiedBy;

    // Interface marker dùng để đánh dấu nhóm kiểm tra dữ liệu khi TẠO MỚI
    public interface Create {}

    // Interface marker dùng để đánh dấu nhóm kiểm tra dữ liệu khi CẬP NHẬT
    public interface Update {}

    // Interface marker dùng để đánh dấu nhóm kiểm tra dữ liệu khi DTO này là DTO lồng nhau (con của DTO khác)
    public interface Nested {}
}