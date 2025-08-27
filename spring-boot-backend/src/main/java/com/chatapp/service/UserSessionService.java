package com.chatapp.service;

import com.chatapp.model.UserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing user sessions and activity tracking
 * 
 * Provides session management, activity updates, and user presence
 * tracking across the chat system.
 */
@Service
public class UserSessionService {

    private static final Logger logger = LoggerFactory.getLogger(UserSessionService.class);
    
    // Thread-safe storage for active sessions
    private final ConcurrentHashMap<String, UserSession> activeSessions = new ConcurrentHashMap<>();

    /**
     * Create or update user session
     * 
     * @param sessionId WebSocket session ID
     * @param username User name
     * @return Created or updated session
     */
    public UserSession createOrUpdateSession(String sessionId, String username) {
        UserSession session = activeSessions.computeIfAbsent(sessionId, 
            id -> {
                UserSession newSession = new UserSession(id, username);
                logger.info("Created new session for user: {} (Session: {})", username, id);
                return newSession;
            });
        
        // Update username if different
        if (!username.equals(session.getUsername())) {
            session.setUsername(username);
            logger.info("Updated username for session {}: {}", sessionId, username);
        }
        
        session.updateActivity();
        return session;
    }

    /**
     * Get session by ID
     * 
     * @param sessionId Session identifier
     * @return UserSession if found, null otherwise
     */
    public UserSession getSession(String sessionId) {
        return activeSessions.get(sessionId);
    }

    /**
     * Remove session
     * 
     * @param sessionId Session identifier
     * @return Removed session, null if not found
     */
    public UserSession removeSession(String sessionId) {
        UserSession removed = activeSessions.remove(sessionId);
        if (removed != null) {
            removed.deactivate();
            logger.info("Removed session for user: {} (Session: {})", 
                       removed.getUsername(), sessionId);
        }
        return removed;
    }

    /**
     * Update user activity for a session
     * 
     * @param roomId Room where activity occurred
     * @param username Username (for verification)
     */
    public void updateUserActivity(String roomId, String username) {
        // Find session by username (since we might not have session ID in message context)
        activeSessions.values().stream()
                .filter(session -> username.equals(session.getUsername()))
                .forEach(UserSession::updateActivity);
    }

    /**
     * Update activity for specific session
     * 
     * @param sessionId Session identifier
     */
    public void updateSessionActivity(String sessionId) {
        UserSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.updateActivity();
            logger.debug("Updated activity for session: {}", sessionId);
        }
    }

    /**
     * Check if user is active
     * 
     * @param username Username to check
     * @return true if user has active session
     */
    public boolean isUserActive(String username) {
        return activeSessions.values().stream()
                .anyMatch(session -> username.equals(session.getUsername()) && session.isActive());
    }

    /**
     * Get active session count
     * 
     * @return Number of active sessions
     */
    public int getActiveSessionCount() {
        return (int) activeSessions.values().stream()
                .filter(UserSession::isActive)
                .count();
    }

    /**
     * Get session by username
     * 
     * @param username Username to find
     * @return UserSession if found, null otherwise
     */
    public UserSession getSessionByUsername(String username) {
        return activeSessions.values().stream()
                .filter(session -> username.equals(session.getUsername()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Cleanup stale sessions
     * 
     * @param inactiveMinutes Minutes of inactivity to consider stale
     * @return Number of sessions cleaned up
     */
    public int cleanupStaleSessions(long inactiveMinutes) {
        var staleSessions = activeSessions.values().stream()
                .filter(session -> session.isStale(inactiveMinutes))
                .toList();
                
        int cleanedUp = 0;
        for (UserSession staleSession : staleSessions) {
            removeSession(staleSession.getSessionId());
            cleanedUp++;
        }
        
        if (cleanedUp > 0) {
            logger.info("Cleaned up {} stale sessions", cleanedUp);
        }
        
        return cleanedUp;
    }

    /**
     * Deactivate session without removing it
     * 
     * @param sessionId Session identifier
     * @return true if session was deactivated
     */
    public boolean deactivateSession(String sessionId) {
        UserSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.deactivate();
            logger.info("Deactivated session for user: {} (Session: {})", 
                       session.getUsername(), sessionId);
            return true;
        }
        return false;
    }

    /**
     * Reactivate session
     * 
     * @param sessionId Session identifier
     * @return true if session was reactivated
     */
    public boolean reactivateSession(String sessionId) {
        UserSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.setActive(true);
            session.updateActivity();
            logger.info("Reactivated session for user: {} (Session: {})", 
                       session.getUsername(), sessionId);
            return true;
        }
        return false;
    }

    /**
     * Get user statistics
     * 
     * @return User session statistics
     */
    public UserStats getStats() {
        long totalSessions = activeSessions.size();
        long activeSessions = this.activeSessions.values().stream()
                .filter(UserSession::isActive)
                .count();
        long inactiveSessions = totalSessions - activeSessions;
        
        return new UserStats(totalSessions, activeSessions, inactiveSessions);
    }

    /**
     * Statistics data class
     */
    public static class UserStats {
        private final long totalSessions;
        private final long activeSessions;
        private final long inactiveSessions;

        public UserStats(long totalSessions, long activeSessions, long inactiveSessions) {
            this.totalSessions = totalSessions;
            this.activeSessions = activeSessions;
            this.inactiveSessions = inactiveSessions;
        }

        public long getTotalSessions() { return totalSessions; }
        public long getActiveSessions() { return activeSessions; }
        public long getInactiveSessions() { return inactiveSessions; }
    }
}