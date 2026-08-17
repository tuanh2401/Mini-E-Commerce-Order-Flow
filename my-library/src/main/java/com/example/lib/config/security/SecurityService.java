package com.example.lib.config.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RequiredArgsConstructor
@Slf4j
//Cung cấp hàm kiểm tra truy cập động
public class SecurityService {
    private final StringRedisTemplate stringRedisTemplate;
    public boolean hasPermission(String permissionName) {
        //1.Lấy thông tin xác thực hiện tại của người dùng từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if(authentication == null || !authentication.isAuthenticated()) {
                return false;
            }
            //Lấy tên vai trò hiện tại(vd : role_Admin , role_user,..)
        String roleName = authentication.getAuthorities().iterator().next().getAuthority();
            //Tạo key tương ứng với key đã lưu ở Auth-Service (role name trong DB là ROLE_USER, ROLE_ADMIN)
        String redisKey = "role:" + roleName;
        //Ktr permissionName có nằm trong Set của Role trên Redis hay không
        Boolean hasPermission = stringRedisTemplate.opsForSet().isMember(redisKey, permissionName);
        log.info("Kiểm tra quyền - Role [{}], Permission yêu cầu: [{}], Kết quả: [{}]", roleName, permissionName , hasPermission);
        return hasPermission != null && hasPermission;
    }



}
