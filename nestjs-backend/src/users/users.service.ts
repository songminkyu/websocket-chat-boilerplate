import { Injectable, Logger } from '@nestjs/common';
import { UserSession } from '../chat/interfaces/chat.interface';

/**
 * Service for managing user sessions and activity tracking
 * 
 * Provides session management, activity updates, and user presence
 * tracking across the chat system.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  
  // In-memory storage for active user sessions
  private readonly userSessions = new Map<string, UserSession>();

  /**
   * Create or update user session
   */
  async createUserSession(
    sessionId: string,
    username: string,
    roomId?: string,
  ): Promise<UserSession> {
    const session: UserSession = {
      sessionId,
      username,
      joinedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      roomId,
    };

    this.userSessions.set(sessionId, session);
    this.logger.log(`👤 Created session for user: ${username} (${sessionId})`);

    return session;
  }

  /**
   * Get session by ID
   */
  async getUserSession(sessionId: string): Promise<UserSession | null> {
    return this.userSessions.get(sessionId) || null;
  }

  /**
   * Remove user session
   */
  async removeUserSession(sessionId: string): Promise<boolean> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const deleted = this.userSessions.delete(sessionId);
    if (deleted) {
      this.logger.log(`🗑️ Removed session for user: ${session.username} (${sessionId})`);
    }

    return deleted;
  }

  /**
   * Update user activity
   */
  async updateUserActivity(sessionId: string): Promise<boolean> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.lastActivity = new Date().toISOString();
    this.logger.debug(`🔄 Updated activity for user: ${session.username}`);

    return true;
  }

  /**
   * Get all active sessions
   */
  async getAllActiveSessions(): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(session => session.isActive);
  }

  /**
   * Get sessions by username
   */
  async getSessionsByUsername(username: string): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(
      session => session.username === username && session.isActive
    );
  }

  /**
   * Get sessions in specific room
   */
  async getSessionsInRoom(roomId: string): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(
      session => session.roomId === roomId && session.isActive
    );
  }

  /**
   * Check if user is active
   */
  async isUserActive(username: string): Promise<boolean> {
    return Array.from(this.userSessions.values()).some(
      session => session.username === username && session.isActive
    );
  }

  /**
   * Get active session count
   */
  async getActiveSessionCount(): Promise<number> {
    return Array.from(this.userSessions.values()).filter(session => session.isActive).length;
  }

  /**
   * Deactivate session
   */
  async deactivateSession(sessionId: string): Promise<boolean> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.isActive = false;
    session.lastActivity = new Date().toISOString();

    this.logger.log(`😴 Deactivated session for user: ${session.username} (${sessionId})`);
    return true;
  }

  /**
   * Reactivate session
   */
  async reactivateSession(sessionId: string): Promise<boolean> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.isActive = true;
    session.lastActivity = new Date().toISOString();

    this.logger.log(`😊 Reactivated session for user: ${session.username} (${sessionId})`);
    return true;
  }

  /**
   * Clean up stale sessions
   */
  async cleanupStaleSessions(inactiveMinutes: number = 30): Promise<number> {
    const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000);
    let cleanedUp = 0;

    for (const [sessionId, session] of this.userSessions.entries()) {
      const lastActivity = new Date(session.lastActivity);
      
      if (lastActivity < cutoffTime) {
        this.userSessions.delete(sessionId);
        cleanedUp++;
        this.logger.log(`🧹 Cleaned up stale session: ${session.username} (${sessionId})`);
      }
    }

    if (cleanedUp > 0) {
      this.logger.log(`🧹 Session cleanup completed: ${cleanedUp} stale sessions removed`);
    }

    return cleanedUp;
  }

  /**
   * Update user's room association
   */
  async updateUserRoom(sessionId: string, roomId: string | null): Promise<boolean> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const previousRoom = session.roomId;
    session.roomId = roomId;
    session.lastActivity = new Date().toISOString();

    this.logger.log(`🏠 Updated room for user ${session.username}: ${previousRoom} → ${roomId}`);
    return true;
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    inactiveSessions: number;
    timestamp: string;
  }> {
    const allSessions = Array.from(this.userSessions.values());
    const activeSessions = allSessions.filter(session => session.isActive);
    const inactiveSessions = allSessions.filter(session => !session.isActive);

    return {
      totalSessions: allSessions.length,
      activeSessions: activeSessions.length,
      inactiveSessions: inactiveSessions.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(): Promise<{
    activeUsers: string[];
    inactiveUsers: string[];
    usersByRoom: Record<string, string[]>;
    timestamp: string;
  }> {
    const allSessions = Array.from(this.userSessions.values());
    
    const activeUsers = allSessions
      .filter(session => session.isActive)
      .map(session => session.username);
    
    const inactiveUsers = allSessions
      .filter(session => !session.isActive)
      .map(session => session.username);

    const usersByRoom: Record<string, string[]> = {};
    allSessions
      .filter(session => session.isActive && session.roomId)
      .forEach(session => {
        if (!usersByRoom[session.roomId!]) {
          usersByRoom[session.roomId!] = [];
        }
        usersByRoom[session.roomId!].push(session.username);
      });

    return {
      activeUsers: [...new Set(activeUsers)], // Remove duplicates
      inactiveUsers: [...new Set(inactiveUsers)],
      usersByRoom,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check for duplicate usernames in room
   */
  async checkDuplicateUsersInRoom(roomId: string, username: string): Promise<boolean> {
    const roomSessions = await this.getSessionsInRoom(roomId);
    return roomSessions.some(session => session.username === username);
  }

  /**
   * Get session duration for user
   */
  async getSessionDuration(sessionId: string): Promise<number> {
    const session = this.userSessions.get(sessionId);
    if (!session) {
      return 0;
    }

    const joinedAt = new Date(session.joinedAt).getTime();
    const now = Date.now();
    
    return Math.floor((now - joinedAt) / 1000); // Duration in seconds
  }

  /**
   * Get users with longest sessions
   */
  async getLongestSessions(limit: number = 10): Promise<Array<{ username: string; duration: number; sessionId: string }>> {
    const sessions = Array.from(this.userSessions.entries());
    const now = Date.now();

    const sessionsWithDuration = sessions
      .filter(([_, session]) => session.isActive)
      .map(([sessionId, session]) => ({
        username: session.username,
        sessionId,
        duration: Math.floor((now - new Date(session.joinedAt).getTime()) / 1000),
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);

    return sessionsWithDuration;
  }
}