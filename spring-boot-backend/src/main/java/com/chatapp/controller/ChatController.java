package com.chatapp.controller;

import com.chatapp.dto.ChatMessageDto;
import com.chatapp.model.ChatMessage;
import com.chatapp.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;

/**
 * WebSocket controller for handling chat messages via STOMP protocol
 * 
 * Handles all WebSocket message endpoints:
 * - /app/chat.sendMessage - Send chat messages
 * - /app/chat.addUser - User join notifications
 * - /app/chat.removeUser - User leave notifications
 */
@Controller
@Validated
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Handle chat message sending
     * 
     * Endpoint: /app/chat.sendMessage
     * Destination: /topic/public/{roomId}
     * 
     * @param messageDto Validated message data
     * @param headerAccessor WebSocket session information
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Valid @Payload ChatMessageDto messageDto,
                           SimpMessageHeaderAccessor headerAccessor) {
        
        String sessionId = headerAccessor.getSessionId();
        
        logger.info("Received message from session {}: {}", sessionId, messageDto);
        
        try {
            // Create chat message
            ChatMessage message = ChatMessage.createChatMessage(
                messageDto.getRoomId(),
                messageDto.getSender(),
                messageDto.getContent()
            );
            
            // Process and broadcast message
            boolean success = chatService.processMessage(message);
            
            if (!success) {
                sendErrorToUser(sessionId, "Failed to send message", messageDto);
            }
            
        } catch (Exception e) {
            logger.error("Error processing message from session {}: {}", sessionId, e.getMessage(), e);
            sendErrorToUser(sessionId, "Message processing error", messageDto);
        }
    }

    /**
     * Handle user joining room
     * 
     * Endpoint: /app/chat.addUser  
     * Destination: /topic/public/{roomId} + /topic/status/{roomId}
     * 
     * @param messageDto Message containing room and user info
     * @param headerAccessor WebSocket session information
     */
    @MessageMapping("/chat.addUser")
    public void addUser(@Valid @Payload ChatMessageDto messageDto,
                       SimpMessageHeaderAccessor headerAccessor) {
        
        String sessionId = headerAccessor.getSessionId();
        String username = messageDto.getSender();
        String roomId = messageDto.getRoomId();
        
        logger.info("User {} joining room {} (Session: {})", username, roomId, sessionId);
        
        try {
            // Store username in WebSocket session
            headerAccessor.getSessionAttributes().put("username", username);
            headerAccessor.getSessionAttributes().put("roomId", roomId);
            
            // Handle user join
            boolean success = chatService.handleUserJoin(roomId, username, sessionId);
            
            if (!success) {
                sendErrorToUser(sessionId, "Failed to join room", messageDto);
            }
            
        } catch (Exception e) {
            logger.error("Error adding user {} to room {}: {}", username, roomId, e.getMessage(), e);
            sendErrorToUser(sessionId, "Failed to join room", messageDto);
        }
    }

    /**
     * Handle user leaving room
     * 
     * Endpoint: /app/chat.removeUser
     * Destination: /topic/public/{roomId} + /topic/status/{roomId}
     * 
     * @param messageDto Message containing room and user info
     * @param headerAccessor WebSocket session information
     */
    @MessageMapping("/chat.removeUser")
    public void removeUser(@Valid @Payload ChatMessageDto messageDto,
                          SimpMessageHeaderAccessor headerAccessor) {
        
        String sessionId = headerAccessor.getSessionId();
        String username = messageDto.getSender();
        String roomId = messageDto.getRoomId();
        
        logger.info("User {} leaving room {} (Session: {})", username, roomId, sessionId);
        
        try {
            // Handle user leave
            boolean success = chatService.handleUserLeave(roomId, username, sessionId);
            
            if (!success) {
                logger.warn("Failed to remove user {} from room {}", username, roomId);
            }
            
            // Clear session attributes
            headerAccessor.getSessionAttributes().remove("username");
            headerAccessor.getSessionAttributes().remove("roomId");
            
        } catch (Exception e) {
            logger.error("Error removing user {} from room {}: {}", username, roomId, e.getMessage(), e);
        }
    }

    /**
     * Send error message to specific user
     * 
     * @param sessionId Target session ID
     * @param errorMessage Error description
     * @param originalMessage Original message that caused error
     */
    @SendToUser("/queue/errors")
    private void sendErrorToUser(String sessionId, String errorMessage, ChatMessageDto originalMessage) {
        ErrorMessage error = new ErrorMessage(
            errorMessage,
            System.currentTimeMillis(),
            originalMessage != null ? originalMessage.toString() : "Unknown"
        );
        
        logger.warn("Sending error to session {}: {}", sessionId, errorMessage);
        
        // Note: This would need additional configuration for user-specific messaging
        // For now, we just log the error. In a full implementation, we'd use
        // SimpMessagingTemplate with user-specific destinations
    }

    /**
     * Error message data class
     */
    public static class ErrorMessage {
        private String message;
        private long timestamp;
        private String originalPayload;

        public ErrorMessage(String message, long timestamp, String originalPayload) {
            this.message = message;
            this.timestamp = timestamp;
            this.originalPayload = originalPayload;
        }

        // Getters
        public String getMessage() { return message; }
        public long getTimestamp() { return timestamp; }
        public String getOriginalPayload() { return originalPayload; }
    }
}