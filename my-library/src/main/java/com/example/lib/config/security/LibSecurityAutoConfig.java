        package com.example.lib.config.security;

        import jakarta.annotation.PostConstruct;
        import lombok.extern.slf4j.Slf4j;
        import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
        import org.springframework.boot.web.servlet.FilterRegistrationBean;
        import org.springframework.context.annotation.Bean;
        import org.springframework.context.annotation.Configuration;
        import org.springframework.data.redis.core.StringRedisTemplate;
        import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
        import org.springframework.security.crypto.password.PasswordEncoder;
//Cấu hình bảo mật dùng chung cho tất cả service
        @Slf4j
        @Configuration //chứa các bean
        @ConditionalOnClass(name = "org.springframework.security.config.annotation.web.builders.HttpSecurity")
        //Chỉ chạy config nếu project có servlet(Web)
        public class LibSecurityAutoConfig {
            @PostConstruct
            public void init() {
                log.info("Khởi tạo cấu hình bảo mật dùng chung");
            }

            // Tạo bean JwtAuthFilter dùng chung (JWTAuthFilter : chặn rq -> kiểm tra jwt -> done or reject)
            @Bean
            public JwtAuthFilter jwtAuthFilter() {
                log.info("Khởi tạo JWTAuthFilter");
                return new JwtAuthFilter();
            }
            @Bean //FilterRegistrationBean = cấu hình Filter chạy như nào
            public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter filter) {
                log.info("Đang cấu hình JWTAuthFilter");
                FilterRegistrationBean<JwtAuthFilter> reg = new FilterRegistrationBean<>(filter);
                reg.setEnabled(false); //Không cho Spring tự động đăng ký filter
                //Nếu k tắt (true mặc đinh) Spring sẽ tự động add filter vào mọi req => nguy hiểm
                //Set false => tự control
                log.info("Đã tắt tự động đăng ký JWTAuthFilter");
                return reg;
            }

            @Bean
            public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
            }
            @Bean("ss")
            public SecurityService securityService(StringRedisTemplate stringRedisTemplate) {
                log.info("Khởi tạo Custom Security Bean : 'ss'");
                return new SecurityService(stringRedisTemplate);
            }

        }
