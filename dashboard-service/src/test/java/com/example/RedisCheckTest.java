package com.example;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.Set;

@SpringBootTest
class RedisCheckTest {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Test
    void checkRedis() {
        Set<String> perms = stringRedisTemplate.opsForSet().members("role:ROLE_ADMIN");
        System.out.println("========== REDIS PERMISSIONS FOR ROLE_ADMIN ==========");
        if (perms != null) {
            for (String p : perms) {
                System.out.println(" - " + p);
            }
        } else {
            System.out.println("No permissions found (Set is null)");
        }
        System.out.println("======================================================");
    }
}
