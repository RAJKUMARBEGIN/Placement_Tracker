package com.quizapplication.placement_tracker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI placementTrackerOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Local Development Server");

        Contact contact = new Contact();
        contact.setName("Placement Tracker Team");
        contact.setEmail("support@placementtracker.com");

        Info info = new Info()
                .title("Placement Tracker API")
                .version("1.0.0")
                .description("API documentation for the Placement Tracker application. " +
                        "This platform helps current students learn from the interview experiences " +
                        "of placed seniors, including questions asked, preparation strategies, " +
                        "and resources used.")
                .contact(contact)
                .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT"));

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer));
    }
}

