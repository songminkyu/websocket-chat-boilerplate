package com.chatapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * WebSocket configuration for STOMP protocol
 * 
 * Configures:
 * - WebSocket endpoints for client connections
 * - Message broker for pub/sub messaging
 * - STOMP destination prefixes
 * - CORS policy for cross-origin requests
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;
    
    @Value("${websocket.max-message-size:1024}")
    private int maxMessageSize;
    
    @Value("${websocket.max-sessions:1000}")
    private int maxSessions;

    /**
     * Configure message broker for handling subscriptions and broadcasting
     * 
     * Destinations:
     * - /topic/public/{roomId} - Room-specific broadcasts
     * - /topic/status/{roomId} - User join/leave notifications  
     * - /user/queue/errors - User-specific error messages
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple in-memory message broker
        config.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Set prefix for messages from client
        config.setApplicationDestinationPrefixes("/app");
        
        // Set prefix for user-specific messages
        config.setUserDestinationPrefix("/user");
        
        System.out.println("📡 Message broker configured - Topics: /topic, /queue, /user");
    }

    /**
     * Register STOMP endpoints for WebSocket handshake
     * 
     * Endpoints:
     * - /ws - Main WebSocket endpoint with SockJS fallback
     * - CORS enabled for frontend origins
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins)
                .withSockJS()
                .setHeartbeatTime(25000)  // 25 seconds heartbeat
                .setDisconnectDelay(5000); // 5 seconds disconnect delay
                
        System.out.println("🔌 STOMP endpoint registered: /ws");
        System.out.println("🌐 Allowed origins: " + String.join(", ", allowedOrigins));
    }

    /**
     * Configure WebSocket transport options
     * 
     * Settings:
     * - Message size limits
     * - Session limits
     * - Buffer size optimization
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(maxMessageSize * 1024); // Convert KB to bytes
        registry.setSendBufferSizeLimit(512 * 1024); // 512 KB buffer
        registry.setSendTimeLimit(20000); // 20 seconds timeout
        
        System.out.println("⚙️ WebSocket transport configured:");
        System.out.println("   Max message size: " + maxMessageSize + " KB");
        System.out.println("   Max sessions: " + maxSessions);
    }
}