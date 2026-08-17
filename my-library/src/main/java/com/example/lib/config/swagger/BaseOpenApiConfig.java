package com.example.lib.config.swagger;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.media.StringSchema;
import java.util.Arrays;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConditionalOnClass(name = "org.springdoc.core.customizers.OpenApiCustomizer")
public class BaseOpenApiConfig {

    @Value("${openapi.title:API Documentation}")
    private String title;

    @Value("${openapi.description:Open API Documentation}")
    private String description;

    @Value("${openapi.version:1.0.0}")
    private String version;

    @Value("${openapi.local-server-url:http://localhost:8080}")
    private String localServerUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description))

                .servers(List.of(
                        new Server().url("http://localhost:8082").description("API Gateway"),
                        new Server().url(localServerUrl).description("Service Local")
                ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
    @Bean
    public OpenApiCustomizer acceptLanguageHeaderCustomizer() {
        return openApi -> openApi.getPaths().values()
                .forEach(pathItem -> pathItem.readOperations()
                        .forEach(operation -> operation.addParametersItem(
                                new HeaderParameter()
                                        .name("Accept-Language")
                                        .description("Selection Language :")
                                        .schema(new StringSchema()
                                                ._enum(Arrays.asList("vi", "en"))
                                                ._default("vi"))
                                        .required(false)
                        )));
    }
}