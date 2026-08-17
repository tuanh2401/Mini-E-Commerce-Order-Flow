package com.example.auth_service.service;

import com.example.auth_service.entity.Permission;
import com.example.auth_service.entity.Role;
import com.example.auth_service.repository.RoleReposiory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RolePermissionSyncService implements ApplicationRunner {
    private final RoleReposiory roleReposiory;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        syncAllRolePermissions();
    }
    public void syncAllRolePermissions() {
        log.info("Bắt đầu đồng bộ danh sách quyền của các vai trò lên Redis.");
        try{
            //Lấy toàn bộ danh sách role từ dtb
            List<Role> roles = roleReposiory.findAll();
            for (Role role : roles) {
                String redisKey = "role:" + role.getName();
                //Xóa dữ liệu cũ của role này trong redis để tránh dữ liệu rác
                stringRedisTemplate.delete(redisKey);
                Set<Permission> permissions = role.getPermissions();
                if(permissions != null && !permissions.isEmpty()){
                    //Lấy danh sách tên quyền
                    String[] permissionNames = permissions.stream().map(Permission::getName).toArray(String[]::new);
                    // Dùng stringRedisTemplate để đồng nhất serializer với SecurityService (đọc cũng dùng stringRedisTemplate)
                    stringRedisTemplate.opsForSet().add(redisKey, permissionNames);
                    log.info("Đồng bộ thành công Role [{}] : {}", role.getName(), permissionNames);
                }else {
                    log.warn("Role [{}] không có quyền nào để đồng bộ",role.getName());
                }
            }
            log.info("Hoàn tất đồng bộ lên Redis.");
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ quyền lên Redis: {}", e.getMessage());
        }
    }
}
