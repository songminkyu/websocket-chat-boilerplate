package com.chatapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration for cross-origin requests
 * 
 * Enables frontend applications to connect to WebSocket endpoints
 * and REST API from different origins (localhost:3000 for development)
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Value("${cors.allowed-methods}")
    private String[] allowedMethods;
    
    @Value("${cors.allowed-headers}")
    private String allowedHeaders;
    
    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    /**
     * Configure CORS settings for REST API endpoints
     * 
     * @return CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins (Frontend URLs)
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        
        // Set allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList(allowedMethods));
        
        // Set allowed headers
        if ("*".equals(allowedHeaders)) {
            configuration.addAllowedHeader("*");
        } else {
            configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        }
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(allowCredentials);
        
        // Expose headers to frontend
        configuration.setExposedHeaders(List.of("Content-Type", "X-Total-Count"));
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        // Apply configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        System.out.println("🌐 CORS configuration applied:");
        System.out.println("   Allowed origins: " + String.join(", ", allowedOrigins));
        System.out.println("   Allowed methods: " + String.join(", ", allowedMethods));
        System.out.println("   Allow credentials: " + allowCredentials);
        
        return source;
    }
}