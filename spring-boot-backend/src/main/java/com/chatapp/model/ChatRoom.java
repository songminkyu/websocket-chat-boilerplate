package com.chatapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Chat room entity representing a chat room in the system
 * 
 * Manages room metadata, active users, and room state.
 * Uses thread-safe collections for concurrent access.
 */
public class ChatRoom {
    
    private String id;
    private String name;
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt;
    
    private Set<UserSession> activeUsers;
    private int messageCount;
    private boolean isPrivate;

    /**
     * Default constructor
     */
    public ChatRoom() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.activeUsers = ConcurrentHashMap.newKeySet();
        this.messageCount = 0;
        this.isPrivate = false;
    }

    /**
     * Constructor for creating chat rooms
     * 
     * @param name Display name of the room
     * @param description Optional room description
     */
    public ChatRoom(String name, String description) {
        this();
        this.name = name;
        this.description = description;
    }

    /**
     * Add user to room
     * 
     * @param user User session to add
     * @return true if user was added, false if already present
     */
    public boolean addUser(UserSession user) {
        return activeUsers.add(user);
    }

    /**
     * Remove user from room
     * 
     * @param sessionId Session ID to remove
     * @return true if user was removed, false if not found
     */
    public boolean removeUser(String sessionId) {
        return activeUsers.removeIf(user -> user.getSessionId().equals(sessionId));
    }

    /**
     * Find user by session ID
     * 
     * @param sessionId Session ID to find
     * @return UserSession if found, null otherwise
     */
    public UserSession findUser(String sessionId) {
        return activeUsers.stream()
                .filter(user -> user.getSessionId().equals(sessionId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Increment message count
     */
    public void incrementMessageCount() {
        this.messageCount++;
    }

    /**
     * Get current user count
     * 
     * @return number of active users
     */
    public int getUserCount() {
        return activeUsers.size();
    }

    /**
     * Check if room is empty
     * 
     * @return true if no active users
     */
    public boolean isEmpty() {
        return activeUsers.isEmpty();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<UserSession> getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Set<UserSession> activeUsers) {
        this.activeUsers = activeUsers;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    @Override
    public String toString() {
        return "ChatRoom{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                ", activeUsers=" + activeUsers.size() +
                ", messageCount=" + messageCount +
                ", isPrivate=" + isPrivate +
                '}';
    }
}