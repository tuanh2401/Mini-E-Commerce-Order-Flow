package com.example.auth_service.service;
import com.example.lib.util.RsaJwtHelper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.security.KeyStore;
import java.security.PrivateKey;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.keystore.path}")
    private String keyStorePath;
    @Value("${jwt.keystore.password}")
    private String keyStorePassword;
    @Value("${jwt.keystore.alias}")
    private String keyStoreAlias; // trong keystore có thể có nhiều key , alias là để tìm đúng key
    @Value("${jwt.expiration}")
    private long expiration;
    @Autowired
    private ResourceLoader resourceLoader; //resourceLoader giúp đọc file linh hoạt
    private RsaJwtHelper rsaJwtHelper;
    @PostConstruct
    public void init() {
        log.info("Đang khởi tạo JwtService: Load Keystore từ path [{}] với alias [{}]", keyStorePath, keyStoreAlias);
      try {
        //Tao keystore obj
        KeyStore keyStore = KeyStore.getInstance("JKS");
        //Doc file keystore tu classpath
        Resource resource = resourceLoader.getResource(keyStorePath);
        try(InputStream inputStream = resource.getInputStream()){
          keyStore.load(inputStream, keyStorePassword.toCharArray());
        }
        //Lấy privatekey từ keyStore bằng alias và password
        PrivateKey privateKey = (PrivateKey) keyStore.getKey(
                keyStoreAlias,
                keyStorePassword.toCharArray()
        );
        //tao rsajwt voi privatekey
        this.rsaJwtHelper = new RsaJwtHelper(privateKey);
        log.info("JWT Service intialized : Load KeyStore và Private Key thành công.");
      }catch (Exception e) {
          log.error("Lỗi khởi tạo JWT : Không thể tạo KeyStore tại [{}]. Chi tiết : {}",keyStorePath, e.getMessage());
        throw new RuntimeException("Không th load keystore: " + e.getMessage(),e);
      }
    }
    public String generateToken(String username, Long userId, String role) {
        log.debug("Đang tạo JWT Token cho User: [{}], ID: [{}], Role: [{}]", username, userId, role);
        String token = rsaJwtHelper.generateToken(username,userId,expiration,role);
        log.info("Đã cấp phát Token thành công cho User [{}]", username);
        return token;
    }
}
