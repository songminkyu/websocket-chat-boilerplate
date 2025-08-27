package com.chatapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Chat message entity representing a single message in the system
 * 
 * Contains all necessary information for message handling, broadcasting,
 * and future persistence capabilities.
 */
public class ChatMessage {
    
    private String id;
    private String roomId;
    private String sender;
    private String content;
    private MessageType type;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;

    /**
     * Default constructor
     */
    public ChatMessage() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.type = MessageType.CHAT;
    }

    /**
     * Constructor for creating chat messages
     * 
     * @param roomId Target room identifier
     * @param sender Username of the sender
     * @param content Message content
     * @param type Message type (CHAT, JOIN, LEAVE, SYSTEM)
     */
    public ChatMessage(String roomId, String sender, String content, MessageType type) {
        this();
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.type = type;
    }

    /**
     * Static factory method for chat messages
     */
    public static ChatMessage createChatMessage(String roomId, String sender, String content) {
        return new ChatMessage(roomId, sender, content, MessageType.CHAT);
    }

    /**
     * Static factory method for join notifications
     */
    public static ChatMessage createJoinMessage(String roomId, String sender) {
        return new ChatMessage(roomId, sender, sender + " joined the room", MessageType.JOIN);
    }

    /**
     * Static factory method for leave notifications
     */
    public static ChatMessage createLeaveMessage(String roomId, String sender) {
        return new ChatMessage(roomId, sender, sender + " left the room", MessageType.LEAVE);
    }

    /**
     * Static factory method for system messages
     */
    public static ChatMessage createSystemMessage(String roomId, String content) {
        return new ChatMessage(roomId, "System", content, MessageType.SYSTEM);
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "id='" + id + '\'' +
                ", roomId='" + roomId + '\'' +
                ", sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                ", type=" + type +
                ", timestamp=" + timestamp +
                '}';
    }
}