package com.example.lib.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;

import java.security.PrivateKey;
import java.security.PublicKey;
import io.jsonwebtoken.*;
import java.util.Date;
//Auth gọi generate , api gọi validate
@Slf4j
public class RsaJwtHelper {
    private final PrivateKey privateKey;
    private final PublicKey publicKey;
    //cst cho auth-service
    public RsaJwtHelper(PrivateKey privateKey) {
        this.privateKey = privateKey;
        this.publicKey = null;
    }
    //cst cho api-gateway
    public RsaJwtHelper(PublicKey publicKey) {
        this.privateKey = null;
        this.publicKey = publicKey;
    }
    //tao jwt bang private key
    public String generateToken(String username , Long userId , long expiration , String role) {
        if(privateKey == null) {
            throw new IllegalStateException("Private key has not been set");
        } //TH chưa có privatekey null
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        return Jwts.builder()
                .subject(username)

                .claim("userId",userId)
                .claim("role",role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(privateKey,Jwts.SIG.RS256) // kí token với rsa
                .compact(); //đóng gói

    }
    //lay claims = public key
    private Claims getClaims(String token) {
        if(publicKey == null) {
            throw new IllegalStateException("Public key has not been set");
        }
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    //kiểm tra token
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        }catch (ExpiredJwtException e) {
            log.error("Xác thực JWT thất bại : Token hết hạn , thời gian : {}",e.getClaims(),new Date());
        }catch (SignatureException e) {
            log.error("Xác thực JWT thất bại : Chữ kí không hợp lệ");
        } catch (MalformedJwtException e) {
            log.error("Xác thực JWT thất bại : Định dạng token không đúng cấu trúc");
        } catch (UnsupportedJwtException e) {
            log.error("Xác thực JWT thất bại : Định dạng token không được như thư viện hỗ trợ");
        } catch (IllegalArgumentException e) {
            log.error("Xác thực JWT thất bại : Chuỗi claims đã bị trống hoặc null");
        } catch (Exception e) {
            log.error("Xác thực JWT thất bại : Đã xảy ra lỗi không xác định : {}",e.getMessage());
        }
        return false;
    }
    //lay username tu token
    public String extractUsername(String token) {

        return getClaims(token).getSubject();
    }
    //Lay userid tu token
    public Long extractUserId(String token) {
        Object userId = getClaims(token).get("userId");
        if(userId instanceof Integer) {
            return ((Integer) userId).longValue();
        }
        if (userId instanceof Long) {
            return (Long) userId;
        }
        return Long.valueOf(userId.toString());
    }
    //Lấy role từ token
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }
}

