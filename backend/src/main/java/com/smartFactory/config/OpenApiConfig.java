package com.smartFactory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("개발 서버")
                ))
                .info(new Info()
                        .title("Smart Factory API")
                        .version("1.0.0")
                        .description("스마트 팩토리 생산 관리 시스템 API 문서"));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("smart-factory")  // API 그룹 이름
                .pathsToMatch("/api/**")  // API 경로 패턴
                .build();
    }

    @Bean
    public GroupedOpenApi productionApi() {
        return GroupedOpenApi.builder()
                .group("production")
                .pathsToMatch("/api/production/**")
                .build();
    }

    @Bean
    public GroupedOpenApi inventoryApi() {
        return GroupedOpenApi.builder()
                .group("inventory")
                .pathsToMatch("/api/inventory/**")
                .build();
    }
}
