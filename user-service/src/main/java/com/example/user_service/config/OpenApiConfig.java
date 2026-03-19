package com.example.user_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                // Cấu hình thông tin cơ bản
                .info(new Info()
                        .title("User Service API")
                        .version("1.0.0")
                        .description("Tài liệu API cho User Service (Mini E-commerce)"))
                // Các Servers (API Gateway là mặc định)
                .addServersItem(new Server().url("http://localhost:8082").description("API Gateway"))
                .addServersItem(new Server().url("http://localhost:8088").description("User Service Local"))
                // Cấu hình nút Auth (Nhập JWT Token) cho Swagger
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}

