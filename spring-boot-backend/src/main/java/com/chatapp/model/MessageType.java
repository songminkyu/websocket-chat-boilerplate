package com.chatapp.model;

/**
 * Enumeration of message types in the chat system
 * 
 * Used to categorize different types of messages for proper handling
 * and display in the frontend application.
 */
public enum MessageType {
    /**
     * Regular chat message from user
     */
    CHAT,
    
    /**
     * System notification when user joins room
     */
    JOIN,
    
    /**
     * System notification when user leaves room  
     */
    LEAVE,
    
    /**
     * System-generated messages (announcements, etc.)
     */
    SYSTEM
}