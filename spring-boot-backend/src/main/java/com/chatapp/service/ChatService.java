package com.chatapp.service;

import com.chatapp.model.ChatMessage;
import com.chatapp.model.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service for handling chat message processing and broadcasting
 * 
 * Manages message validation, processing, and distribution to
 * subscribed clients via STOMP destinations.
 */
@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomService roomService;
    private final UserSessionService userSessionService;

    public ChatService(SimpMessagingTemplate messagingTemplate, 
                      RoomService roomService,
                      UserSessionService userSessionService) {
        this.messagingTemplate = messagingTemplate;
        this.roomService = roomService;
        this.userSessionService = userSessionService;
    }

    /**
     * Process and broadcast chat message
     * 
     * @param message Chat message to process
     * @return true if message was processed successfully
     */
    public boolean processMessage(ChatMessage message) {
        try {
            // Validate message
            if (!isValidMessage(message)) {
                logger.warn("Invalid message received: {}", message);
                return false;
            }

            // Sanitize message content
            message.setContent(sanitizeContent(message.getContent()));
            
            // Update room message count
            roomService.incrementMessageCount(message.getRoomId());
            
            // Update user activity
            userSessionService.updateUserActivity(message.getRoomId(), message.getSender());
            
            // Broadcast to room subscribers
            broadcastToRoom(message.getRoomId(), message);
            
            logger.info("Message processed and broadcast: {} in room {}", 
                       message.getSender(), message.getRoomId());
            
            return true;
            
        } catch (Exception e) {
            logger.error("Error processing message: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Handle user joining room
     * 
     * @param roomId Target room ID
     * @param username User joining the room
     * @param sessionId WebSocket session ID
     * @return true if join was successful
     */
    public boolean handleUserJoin(String roomId, String username, String sessionId) {
        try {
            // Add user to room
            boolean added = roomService.addUserToRoom(roomId, username, sessionId);
            
            if (added) {
                // Create and broadcast join message
                ChatMessage joinMessage = ChatMessage.createJoinMessage(roomId, username);
                broadcastToRoom(roomId, joinMessage);
                
                // Broadcast user status update
                broadcastUserStatus(roomId, username, "joined");
                
                logger.info("User {} joined room {}", username, roomId);
                return true;
            }
            
            return false;
            
        } catch (Exception e) {
            logger.error("Error handling user join: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Handle user leaving room
     * 
     * @param roomId Target room ID  
     * @param username User leaving the room
     * @param sessionId WebSocket session ID
     * @return true if leave was successful
     */
    public boolean handleUserLeave(String roomId, String username, String sessionId) {
        try {
            // Remove user from room
            boolean removed = roomService.removeUserFromRoom(roomId, sessionId);
            
            if (removed) {
                // Create and broadcast leave message
                ChatMessage leaveMessage = ChatMessage.createLeaveMessage(roomId, username);
                broadcastToRoom(roomId, leaveMessage);
                
                // Broadcast user status update
                broadcastUserStatus(roomId, username, "left");
                
                logger.info("User {} left room {}", username, roomId);
                return true;
            }
            
            return false;
            
        } catch (Exception e) {
            logger.error("Error handling user leave: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Broadcast message to all room subscribers
     * 
     * @param roomId Target room ID
     * @param message Message to broadcast
     */
    private void broadcastToRoom(String roomId, ChatMessage message) {
        String destination = "/topic/public/" + roomId;
        messagingTemplate.convertAndSend(destination, message);
        logger.debug("Message broadcast to {}: {}", destination, message.getContent());
    }

    /**
     * Broadcast user status change to room
     * 
     * @param roomId Target room ID
     * @param username Username
     * @param status Status change (joined/left)
     */
    private void broadcastUserStatus(String roomId, String username, String status) {
        String destination = "/topic/status/" + roomId;
        var statusMessage = new UserStatusMessage(username, status, System.currentTimeMillis());
        messagingTemplate.convertAndSend(destination, statusMessage);
        logger.debug("User status broadcast to {}: {} {}", destination, username, status);
    }

    /**
     * Validate message content and structure
     * 
     * @param message Message to validate
     * @return true if message is valid
     */
    private boolean isValidMessage(ChatMessage message) {
        if (message == null) return false;
        if (message.getRoomId() == null || message.getRoomId().trim().isEmpty()) return false;
        if (message.getSender() == null || message.getSender().trim().isEmpty()) return false;
        if (message.getContent() == null || message.getContent().trim().isEmpty()) return false;
        if (message.getContent().length() > 1000) return false;
        
        return true;
    }

    /**
     * Sanitize message content to prevent XSS
     * 
     * @param content Original content
     * @return Sanitized content
     */
    private String sanitizeContent(String content) {
        if (content == null) return "";
        
        return content
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\"", "&quot;")
                .replaceAll("'", "&#x27;")
                .replaceAll("/", "&#x2F;")
                .trim();
    }

    /**
     * Inner class for user status messages
     */
    public static class UserStatusMessage {
        private String username;
        private String status;
        private long timestamp;

        public UserStatusMessage(String username, String status, long timestamp) {
            this.username = username;
            this.status = status;
            this.timestamp = timestamp;
        }

        // Getters
        public String getUsername() { return username; }
        public String getStatus() { return status; }
        public long getTimestamp() { return timestamp; }
    }
}