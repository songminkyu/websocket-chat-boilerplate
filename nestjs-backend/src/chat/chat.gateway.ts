import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { ChatMessageDto, JoinRoomDto } from './dto/chat-message.dto';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';

/**
 * WebSocket Gateway for real-time chat messaging
 * 
 * Handles all WebSocket connections and message routing:
 * - Client connection/disconnection management
 * - Message broadcasting with STOMP-like destinations
 * - User presence tracking
 * - Room subscription management
 * - Error handling and validation
 */
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
@UseFilters(WsExceptionFilter)
@UsePipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Gateway initialization
   */
  afterInit(server: Server) {
    this.logger.log('🔗 WebSocket Gateway initialized');
    this.logger.log('📡 Socket.IO server ready for connections');
  }

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    const clientId = client.id;
    this.logger.log(`👋 Client connected: ${clientId}`);
    
    // Store connection metadata
    client.data = {
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    // Send connection acknowledgment
    client.emit('connection', {
      status: 'connected',
      clientId,
      timestamp: new Date().toISOString(),
      message: 'Successfully connected to chat server',
    });
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket) {
    const clientId = client.id;
    const username = client.data?.username;
    const roomId = client.data?.roomId;

    this.logger.log(`👋 Client disconnected: ${clientId} (${username || 'anonymous'})`);

    // Handle user leaving room if they were in one
    if (username && roomId) {
      try {
        await this.handleUserLeave(client, { roomId, sender: username });
      } catch (error) {
        this.logger.error(`Error handling disconnect for user ${username}:`, error);
      }
    }

    // Remove user session
    if (username) {
      await this.usersService.removeUserSession(clientId);
    }
  }

  /**
   * Handle chat message sending
   * Equivalent to STOMP destination: /app/chat.sendMessage
   */
  @SubscribeMessage('chat.sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageDto: ChatMessageDto,
  ) {
    const clientId = client.id;
    const { roomId, sender, content } = messageDto;

    this.logger.log(`💬 Message from ${sender} in room ${roomId}: ${content}`);

    try {
      // Update user activity
      await this.usersService.updateUserActivity(clientId);
      client.data.lastActivity = new Date().toISOString();

      // Process and broadcast message
      const message = await this.chatService.processMessage({
        roomId,
        sender,
        content,
        sessionId: clientId,
      });

      // Broadcast to room subscribers (equivalent to /topic/public/{roomId})
      this.server.to(`room_${roomId}`).emit('message', message);

      this.logger.log(`📤 Message broadcast to room_${roomId}`);

    } catch (error) {
      this.logger.error(`❌ Error processing message from ${sender}:`, error);
      
      // Send error to specific client
      client.emit('error', {
        message: 'Failed to send message',
        timestamp: Date.now(),
        originalPayload: messageDto,
      });
    }
  }

  /**
   * Handle user joining room
   * Equivalent to STOMP destination: /app/chat.addUser
   */
  @SubscribeMessage('chat.addUser')
  async handleUserJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinDto: JoinRoomDto,
  ) {
    const clientId = client.id;
    const { roomId, sender: username } = joinDto;

    this.logger.log(`🚪 User ${username} joining room ${roomId} (${clientId})`);

    try {
      // Store user info in client data
      client.data.username = username;
      client.data.roomId = roomId;

      // Join Socket.IO room
      await client.join(`room_${roomId}`);

      // Create/update user session
      await this.usersService.createUserSession(clientId, username, roomId);

      // Process join message
      const joinMessage = await this.chatService.handleUserJoin(
        roomId,
        username,
        clientId,
      );

      // Broadcast join message to room
      this.server.to(`room_${roomId}`).emit('message', joinMessage);

      // Broadcast user status update (equivalent to /topic/status/{roomId})
      this.server.to(`room_${roomId}`).emit('userStatus', {
        username,
        status: 'joined',
        timestamp: Date.now(),
      });

      // Send success response to client
      client.emit('joinSuccess', {
        roomId,
        username,
        message: `Successfully joined room ${roomId}`,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ User ${username} successfully joined room ${roomId}`);

    } catch (error) {
      this.logger.error(`❌ Error joining room for ${username}:`, error);
      
      client.emit('joinError', {
        message: 'Failed to join room',
        roomId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle user leaving room  
   * Equivalent to STOMP destination: /app/chat.removeUser
   */
  @SubscribeMessage('chat.removeUser')
  async handleUserLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() leaveDto: JoinRoomDto,
  ) {
    const clientId = client.id;
    const { roomId, sender: username } = leaveDto;

    this.logger.log(`🚪 User ${username} leaving room ${roomId} (${clientId})`);

    try {
      // Leave Socket.IO room
      await client.leave(`room_${roomId}`);

      // Process leave message
      const leaveMessage = await this.chatService.handleUserLeave(
        roomId,
        username,
        clientId,
      );

      // Broadcast leave message to room
      this.server.to(`room_${roomId}`).emit('message', leaveMessage);

      // Broadcast user status update
      this.server.to(`room_${roomId}`).emit('userStatus', {
        username,
        status: 'left',
        timestamp: Date.now(),
      });

      // Clear user data
      client.data.roomId = null;

      // Send success response to client
      client.emit('leaveSuccess', {
        roomId,
        username,
        message: `Successfully left room ${roomId}`,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`✅ User ${username} successfully left room ${roomId}`);

    } catch (error) {
      this.logger.error(`❌ Error leaving room for ${username}:`, error);
      
      client.emit('leaveError', {
        message: 'Failed to leave room',
        roomId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle client ping for connection health
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.data.lastActivity = new Date().toISOString();
    client.emit('pong', {
      timestamp: Date.now(),
      clientId: client.id,
    });
  }

  /**
   * Get active connections count
   */
  getActiveConnections(): number {
    return this.server.engine.clientsCount;
  }

  /**
   * Broadcast system message to all clients in a room
   */
  broadcastSystemMessage(roomId: string, message: string) {
    this.server.to(`room_${roomId}`).emit('systemMessage', {
      roomId,
      content: message,
      timestamp: new Date().toISOString(),
      type: 'SYSTEM',
    });
  }

  /**
   * Broadcast system-wide announcement
   */
  broadcastAnnouncement(message: string) {
    this.server.emit('announcement', {
      content: message,
      timestamp: new Date().toISOString(),
      type: 'ANNOUNCEMENT',
    });
  }
}