package com.chatapp.service;

import com.chatapp.model.ChatRoom;
import com.chatapp.model.UserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing chat rooms and user membership
 * 
 * Handles room creation, user management, and room state tracking
 * using thread-safe collections for concurrent access.
 */
@Service
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);
    
    // Thread-safe storage for chat rooms
    private final ConcurrentHashMap<String, ChatRoom> rooms = new ConcurrentHashMap<>();

    /**
     * Create a new chat room
     * 
     * @param name Room name
     * @param description Room description
     * @return Created room
     */
    public ChatRoom createRoom(String name, String description) {
        ChatRoom room = new ChatRoom(name, description);
        rooms.put(room.getId(), room);
        
        logger.info("Created room: {} (ID: {})", name, room.getId());
        return room;
    }

    /**
     * Get room by ID
     * 
     * @param roomId Room identifier
     * @return ChatRoom if found, null otherwise
     */
    public ChatRoom getRoom(String roomId) {
        return rooms.get(roomId);
    }

    /**
     * Get all rooms
     * 
     * @return Collection of all rooms
     */
    public Collection<ChatRoom> getAllRooms() {
        return rooms.values();
    }

    /**
     * Delete room by ID
     * 
     * @param roomId Room identifier
     * @return true if room was deleted, false if not found
     */
    public boolean deleteRoom(String roomId) {
        ChatRoom removed = rooms.remove(roomId);
        if (removed != null) {
            logger.info("Deleted room: {} (ID: {})", removed.getName(), roomId);
            return true;
        }
        return false;
    }

    /**
     * Add user to room
     * 
     * @param roomId Room identifier
     * @param username User name
     * @param sessionId Session identifier
     * @return true if user was added successfully
     */
    public boolean addUserToRoom(String roomId, String username, String sessionId) {
        ChatRoom room = getOrCreateDefaultRoom(roomId);
        
        UserSession userSession = new UserSession(sessionId, username);
        boolean added = room.addUser(userSession);
        
        if (added) {
            logger.info("Added user {} to room {} (Session: {})", username, roomId, sessionId);
        } else {
            logger.warn("User {} already in room {} (Session: {})", username, roomId, sessionId);
        }
        
        return added;
    }

    /**
     * Remove user from room
     * 
     * @param roomId Room identifier
     * @param sessionId Session identifier
     * @return true if user was removed successfully
     */
    public boolean removeUserFromRoom(String roomId, String sessionId) {
        ChatRoom room = rooms.get(roomId);
        if (room == null) {
            return false;
        }
        
        UserSession user = room.findUser(sessionId);
        boolean removed = room.removeUser(sessionId);
        
        if (removed && user != null) {
            logger.info("Removed user {} from room {} (Session: {})", 
                       user.getUsername(), roomId, sessionId);
        }
        
        // Clean up empty rooms (except default rooms)
        if (room.isEmpty() && !isDefaultRoom(roomId)) {
            rooms.remove(roomId);
            logger.info("Cleaned up empty room: {}", roomId);
        }
        
        return removed;
    }

    /**
     * Increment message count for room
     * 
     * @param roomId Room identifier
     */
    public void incrementMessageCount(String roomId) {
        ChatRoom room = rooms.get(roomId);
        if (room != null) {
            room.incrementMessageCount();
        }
    }

    /**
     * Get users in room
     * 
     * @param roomId Room identifier
     * @return Collection of active users, empty if room not found
     */
    public Collection<UserSession> getRoomUsers(String roomId) {
        ChatRoom room = rooms.get(roomId);
        return room != null ? room.getActiveUsers() : java.util.Collections.emptySet();
    }

    /**
     * Get room user count
     * 
     * @param roomId Room identifier
     * @return Number of active users
     */
    public int getRoomUserCount(String roomId) {
        ChatRoom room = rooms.get(roomId);
        return room != null ? room.getUserCount() : 0;
    }

    /**
     * Check if room exists
     * 
     * @param roomId Room identifier
     * @return true if room exists
     */
    public boolean roomExists(String roomId) {
        return rooms.containsKey(roomId);
    }

    /**
     * Get or create default room if it doesn't exist
     * This ensures users can always join a room even if it wasn't explicitly created
     * 
     * @param roomId Room identifier
     * @return Existing or newly created room
     */
    private ChatRoom getOrCreateDefaultRoom(String roomId) {
        return rooms.computeIfAbsent(roomId, id -> {
            ChatRoom room = new ChatRoom("Room " + id.substring(0, Math.min(8, id.length())), 
                                        "Auto-created room");
            logger.info("Auto-created room: {} (ID: {})", room.getName(), id);
            return room;
        });
    }

    /**
     * Check if room ID represents a default/system room
     * 
     * @param roomId Room identifier
     * @return true if this is a default room
     */
    private boolean isDefaultRoom(String roomId) {
        return roomId.startsWith("general") || roomId.startsWith("lobby");
    }

    /**
     * Cleanup inactive sessions across all rooms
     * Called periodically to remove stale sessions
     * 
     * @param inactiveMinutes Minutes of inactivity to consider stale
     * @return Number of sessions cleaned up
     */
    public int cleanupInactiveSessions(long inactiveMinutes) {
        int cleanedUp = 0;
        
        for (ChatRoom room : rooms.values()) {
            // Remove inactive sessions
            var staleUsers = room.getActiveUsers().stream()
                    .filter(user -> user.isStale(inactiveMinutes))
                    .toList();
                    
            for (UserSession staleUser : staleUsers) {
                room.removeUser(staleUser.getSessionId());
                cleanedUp++;
                logger.info("Cleaned up stale session: {} from room {}", 
                           staleUser.getUsername(), room.getId());
            }
            
            // Remove empty rooms (except default ones)
            if (room.isEmpty() && !isDefaultRoom(room.getId())) {
                rooms.remove(room.getId());
                logger.info("Cleaned up empty room: {}", room.getId());
            }
        }
        
        if (cleanedUp > 0) {
            logger.info("Cleanup completed: {} stale sessions removed", cleanedUp);
        }
        
        return cleanedUp;
    }

    /**
     * Get system statistics
     * 
     * @return Room and user statistics
     */
    public RoomStats getStats() {
        int totalRooms = rooms.size();
        int totalUsers = rooms.values().stream()
                .mapToInt(ChatRoom::getUserCount)
                .sum();
        int totalMessages = rooms.values().stream()
                .mapToInt(ChatRoom::getMessageCount)
                .sum();
                
        return new RoomStats(totalRooms, totalUsers, totalMessages);
    }

    /**
     * Statistics data class
     */
    public static class RoomStats {
        private final int totalRooms;
        private final int totalUsers;
        private final int totalMessages;

        public RoomStats(int totalRooms, int totalUsers, int totalMessages) {
            this.totalRooms = totalRooms;
            this.totalUsers = totalUsers;
            this.totalMessages = totalMessages;
        }

        public int getTotalRooms() { return totalRooms; }
        public int getTotalUsers() { return totalUsers; }
        public int getTotalMessages() { return totalMessages; }
    }
}