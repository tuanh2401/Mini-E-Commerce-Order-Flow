package com.example.user_service.mapper;

import com.example.lib.mapper.EntityMapper;
import com.example.user_service.dto.response.UserResponse;
import com.example.user_service.entity.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Interface Mapper chuyển đổi giữa User Entity và UserResponse DTO.
 */
@Mapper(componentModel = "spring")
public interface UserMapper extends EntityMapper<Long, UserResponse, User> {

    @Override
    @Mapping(source = "fullname", target = "fullName")
    UserResponse toDto(User entity);

    @Override
    @Mapping(source = "fullName", target = "fullname")
    User toEntity(UserResponse dto);

    @Override
    @Mapping(source = "fullName", target = "fullname")
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromDTO(UserResponse dto, @MappingTarget User entity);

    @Mapping(source = "fullName", target = "fullname")
    @Mapping(target = "membershipTier", ignore = true)
    @Mapping(target = "totalSpent", ignore = true)
    @Mapping(target = "totalOrders", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfileFromDTO(UserResponse dto, @MappingTarget User entity);
}