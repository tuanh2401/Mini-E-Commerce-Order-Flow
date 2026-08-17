package com.example.lib.config.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
//Check thông tin user từ api , để bắn sang cho spring security
@Slf4j
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request , HttpServletResponse response , FilterChain filterChain)
            throws ServletException , IOException {
        //1.Lấy userid , role , username từ header
        String userId = request.getHeader("userId");
        String userName = request.getHeader("userName");
        String role = request.getHeader("X-User-Role");
        //2.Nếu có đủ tt , cấp quyền cho user
        if(userId != null && userName != null && role != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            //Nạp vai trò
            if(!role.trim().isEmpty()){
                authorities.add(new SimpleGrantedAuthority("ROLE_"+role));
            }
            //Tạo auth token chứa role và permission
            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userName , null , authorities   );
            SecurityContextHolder.getContext().setAuthentication(token);
            //Log xác thực thành công
            log.info("Xác thực thành công người dùng: UserId={}, userName={}, role={}", userId, userName, role);
        }
        //3.Cho phép rq đi tiếp
        filterChain.doFilter(request, response);
    }
}

