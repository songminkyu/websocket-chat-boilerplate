package com.chatapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * User session entity representing an active user connection
 * 
 * Tracks user presence, connection details, and session state
 * for room management and connection handling.
 */
public class UserSession {
    
    private String sessionId;
    private String username;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime joinedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime lastActivity;
    
    private boolean isActive;

    /**
     * Default constructor
     */
    public UserSession() {
        this.joinedAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
        this.isActive = true;
    }

    /**
     * Constructor for creating user sessions
     * 
     * @param sessionId WebSocket session identifier
     * @param username Display name of the user
     */
    public UserSession(String sessionId, String username) {
        this();
        this.sessionId = sessionId;
        this.username = username;
    }

    /**
     * Update last activity timestamp
     */
    public void updateActivity() {
        this.lastActivity = LocalDateTime.now();
    }

    /**
     * Mark session as inactive
     */
    public void deactivate() {
        this.isActive = false;
        updateActivity();
    }

    /**
     * Check if session is stale (inactive for more than specified minutes)
     * 
     * @param minutes Minutes to consider as stale
     * @return true if session is stale
     */
    public boolean isStale(long minutes) {
        return lastActivity.isBefore(LocalDateTime.now().minusMinutes(minutes));
    }

    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSession that = (UserSession) o;
        return Objects.equals(sessionId, that.sessionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sessionId);
    }

    @Override
    public String toString() {
        return "UserSession{" +
                "sessionId='" + sessionId + '\'' +
                ", username='" + username + '\'' +
                ", joinedAt=" + joinedAt +
                ", lastActivity=" + lastActivity +
                ", isActive=" + isActive +
                '}';
    }
}