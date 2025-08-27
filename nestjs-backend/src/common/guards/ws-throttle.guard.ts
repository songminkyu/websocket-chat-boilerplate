import { Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Socket } from 'socket.io';

/**
 * WebSocket rate limiting guard
 * 
 * Provides protection against spam and DoS attacks via WebSocket:
 * - Rate limits messages per user session
 * - Configurable limits for different message types
 * - Automatic cleanup of tracking data
 * - Gradual penalties for repeat offenders
 */
@Injectable()
export class WsThrottleGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WsThrottleGuard.name);
  
  // Rate limiting storage: clientId -> { count, resetTime, penalties }
  private readonly rateLimitStore = new Map<string, {
    messageCount: number;
    joinCount: number;
    resetTime: number;
    penalties: number;
    lastActivity: number;
  }>();

  // Rate limiting configuration
  private readonly limits = {
    messages: {
      count: 30, // 30 messages per minute
      window: 60 * 1000, // 1 minute
    },
    joins: {
      count: 5, // 5 room joins per minute
      window: 60 * 1000, // 1 minute
    },
    penalty: {
      multiplier: 2, // Double the window time for each penalty
      maxPenalties: 5, // Maximum penalty level
      resetTime: 5 * 60 * 1000, // 5 minutes to reset penalties
    },
  };

  constructor() {
    super();
    
    // Clean up old entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if client is allowed to send message
   */
  async canActivate(context: any): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    const clientId = client.id;
    const username = client.data?.username || 'anonymous';
    const eventName = context.getHandler().name;

    // Get or create rate limit entry
    let entry = this.rateLimitStore.get(clientId);
    const now = Date.now();
    
    if (!entry) {
      entry = {
        messageCount: 0,
        joinCount: 0,
        resetTime: now + this.limits.messages.window,
        penalties: 0,
        lastActivity: now,
      };
      this.rateLimitStore.set(clientId, entry);
    }

    // Update last activity
    entry.lastActivity = now;

    // Reset counters if window has passed
    if (now > entry.resetTime) {
      const windowTime = this.getWindowTime(entry.penalties);
      entry.messageCount = 0;
      entry.joinCount = 0;
      entry.resetTime = now + windowTime;
      
      // Reduce penalties over time
      if (now > entry.resetTime + this.limits.penalty.resetTime) {
        entry.penalties = Math.max(0, entry.penalties - 1);
      }
    }

    // Check limits based on event type
    const isAllowed = this.checkLimits(eventName, entry, username);
    
    if (!isAllowed) {
      // Increase penalties for repeat offenders
      entry.penalties = Math.min(
        entry.penalties + 1,
        this.limits.penalty.maxPenalties
      );
      
      // Extend reset time with penalty
      const penaltyTime = this.getWindowTime(entry.penalties);
      entry.resetTime = now + penaltyTime;
      
      this.logger.warn(
        `🚨 Rate limit exceeded for ${username} (${clientId}): ${eventName}. ` +
        `Penalties: ${entry.penalties}, Reset in: ${Math.ceil(penaltyTime / 1000)}s`
      );
      
      // Send rate limit error to client
      client.emit('rateLimitError', {
        message: 'Rate limit exceeded. Please slow down.',
        eventType: eventName,
        resetTime: entry.resetTime,
        penalties: entry.penalties,
        timestamp: now,
      });
      
      return false;
    }

    return true;
  }

  /**
   * Check rate limits for specific event types
   */
  private checkLimits(eventName: string, entry: any, username: string): boolean {
    switch (eventName) {
      case 'handleSendMessage':
        if (entry.messageCount >= this.limits.messages.count) {
          return false;
        }
        entry.messageCount++;
        this.logger.debug(`📝 Message rate: ${entry.messageCount}/${this.limits.messages.count} for ${username}`);
        break;

      case 'handleUserJoin':
      case 'handleUserLeave':
        if (entry.joinCount >= this.limits.joins.count) {
          return false;
        }
        entry.joinCount++;
        this.logger.debug(`🚪 Join rate: ${entry.joinCount}/${this.limits.joins.count} for ${username}`);
        break;

      default:
        // For other events, use message limit as default
        if (entry.messageCount >= this.limits.messages.count) {
          return false;
        }
        entry.messageCount++;
        break;
    }

    return true;
  }

  /**
   * Calculate window time with penalties
   */
  private getWindowTime(penalties: number): number {
    const baseWindow = this.limits.messages.window;
    const multiplier = Math.pow(this.limits.penalty.multiplier, penalties);
    return Math.min(baseWindow * multiplier, 10 * 60 * 1000); // Max 10 minutes
  }

  /**
   * Clean up old rate limit entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    let cleanedUp = 0;

    for (const [clientId, entry] of this.rateLimitStore.entries()) {
      if (now - entry.lastActivity > maxAge) {
        this.rateLimitStore.delete(clientId);
        cleanedUp++;
      }
    }

    if (cleanedUp > 0) {
      this.logger.log(`🧹 Cleaned up ${cleanedUp} old rate limit entries`);
    }
  }

  /**
   * Get current rate limit stats
   */
  getStats(): {
    totalTrackedClients: number;
    activeClients: number;
    clientsWithPenalties: number;
    averagePenalties: number;
  } {
    const now = Date.now();
    const entries = Array.from(this.rateLimitStore.values());
    const recentThreshold = 5 * 60 * 1000; // 5 minutes

    const activeClients = entries.filter(
      entry => now - entry.lastActivity < recentThreshold
    ).length;

    const clientsWithPenalties = entries.filter(entry => entry.penalties > 0).length;
    
    const totalPenalties = entries.reduce((sum, entry) => sum + entry.penalties, 0);
    const averagePenalties = entries.length > 0 ? totalPenalties / entries.length : 0;

    return {
      totalTrackedClients: this.rateLimitStore.size,
      activeClients,
      clientsWithPenalties,
      averagePenalties: Math.round(averagePenalties * 100) / 100,
    };
  }

  /**
   * Reset penalties for a specific client (admin function)
   */
  resetClientPenalties(clientId: string): boolean {
    const entry = this.rateLimitStore.get(clientId);
    if (entry) {
      entry.penalties = 0;
      entry.messageCount = 0;
      entry.joinCount = 0;
      entry.resetTime = Date.now() + this.limits.messages.window;
      this.logger.log(`🔄 Reset penalties for client: ${clientId}`);
      return true;
    }
    return false;
  }

  /**
   * Clear all rate limit data (admin function)
   */
  clearAllData(): number {
    const count = this.rateLimitStore.size;
    this.rateLimitStore.clear();
    this.logger.log(`🧹 Cleared all rate limit data (${count} entries)`);
    return count;
  }
}