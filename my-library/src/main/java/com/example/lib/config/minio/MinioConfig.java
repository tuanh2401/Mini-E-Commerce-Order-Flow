package com.example.lib.config.minio;

import com.example.lib.service.MinioService;
import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

//Tạo kết nối tới máy chủ lưu trữ MinIO
@Configuration
@ConfigurationProperties(prefix = "minio")
@ConditionalOnProperty(prefix = "minio", name = "url")
@Data
public class MinioConfig {
    private String url;
    private String accessKey;
    private String secretKey;
    private String bucketName;
    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }
    //Định nghĩa MinioService dùng chung
    @Bean
    public MinioService minioService(MinioClient minioClient) {
        return new MinioService(minioClient,this);
    }
}
