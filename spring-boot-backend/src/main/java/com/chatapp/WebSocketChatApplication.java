package com.chatapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for WebSocket Chat Platform
 * 
 * Features:
 * - Real-time messaging with STOMP protocol
 * - Room-based chat system
 * - WebSocket connection management
 * 
 * @author System Architecture Team
 * @version 1.0
 */
@SpringBootApplication
public class WebSocketChatApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(WebSocketChatApplication.class, args);
        System.out.println("🚀 WebSocket Chat Server started successfully!");
        System.out.println("📡 WebSocket endpoint: ws://localhost:8080/ws");
        System.out.println("🌐 REST API available at: http://localhost:8080/api");
    }
}