package com.chatapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for chat messages
 * 
 * Used for validating incoming message data from WebSocket clients
 * and ensuring data integrity before processing.
 */
public class ChatMessageDto {
    
    @NotBlank(message = "Room ID is required")
    private String roomId;
    
    @NotBlank(message = "Sender is required")
    @Size(min = 3, max = 50, message = "Sender must be between 3 and 50 characters")
    private String sender;
    
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 1000, message = "Content must be between 1 and 1000 characters")
    private String content;

    /**
     * Default constructor
     */
    public ChatMessageDto() {
    }

    /**
     * Constructor with parameters
     * 
     * @param roomId Target room identifier
     * @param sender Username of the sender
     * @param content Message content
     */
    public ChatMessageDto(String roomId, String sender, String content) {
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
    }

    // Getters and Setters
    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "ChatMessageDto{" +
                "roomId='" + roomId + '\'' +
                ", sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                '}';
    }
}