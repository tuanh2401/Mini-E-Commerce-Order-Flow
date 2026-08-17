package com.example.api_gateway.config;

import com.example.lib.util.RsaJwtHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.InputStream;
import java.security.PublicKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;

@Configuration
public class JwtConfig {

    private final ResourceLoader resourceLoader;

    @Value("${jwt.public-key}")
    private String publicKeyPath;

    public JwtConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }
//Load public key từ file .pem khi khởi động , tạo bean rsajwthelper dùng để verify JWT
    @Bean
    public RsaJwtHelper rsaJwtHelper() throws Exception {
        Resource resource = resourceLoader.getResource(publicKeyPath);
        
        try (InputStream is = resource.getInputStream()) {
            CertificateFactory certFactory = CertificateFactory.getInstance("X.509");
            X509Certificate certificate = (X509Certificate) certFactory.generateCertificate(is);
            PublicKey publicKey = certificate.getPublicKey();
            return new RsaJwtHelper(publicKey);
        }
    }
}
