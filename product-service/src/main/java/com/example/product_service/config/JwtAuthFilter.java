package com.example.product_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

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
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userName , null , Collections.singleton(authority));
            SecurityContextHolder.getContext().setAuthentication(token);
        }
        //3.Cho phép rq đi tiếp
        filterChain.doFilter(request, response);
    }
}
