# WebSocket Chat Platform - Technical Design Document

## 🎯 Executive Summary

This document outlines the complete technical architecture for a real-time chat platform supporting dual backend implementations (Spring Boot + NestJS) with a unified Next.js frontend. The system leverages WebSocket/STOMP protocols for low-latency messaging and is designed for horizontal scalability.

## 🏗️ System Architecture Overview

### High-Level Architecture
```
Frontend (Next.js 15+) ←→ Load Balancer ←→ Backend Services ←→ Message Broker ←→ Database
                                         ├─ Spring Boot (8080)
                                         └─ NestJS (3001)
```

### Core Technology Stack
- **Frontend**: Next.js 15+, React, STOMP Client, TypeScript
- **Backend Option 1**: Spring Boot 3.x, Java 17+, Gradle, Spring WebSocket
- **Backend Option 2**: NestJS 10+, Node.js 18+, TypeScript, Socket.IO/STOMP
- **Message Transport**: WebSocket with STOMP protocol
- **Future Persistence**: PostgreSQL + Redis
- **Deployment**: Docker, Kubernetes, Nginx

## 📡 Communication Protocol Design

### STOMP Message Flow
1. **Connection**: Client establishes WebSocket connection to `/ws` (Spring) or `/socket.io` (NestJS)
2. **Authentication**: Future JWT-based session validation
3. **Subscription**: Client subscribes to `/topic/public/{roomId}` for room messages
4. **Publishing**: Messages sent to `/app/chat.sendMessage` for broadcasting
5. **Broadcasting**: Server forwards messages to all room subscribers

### Message Destinations
| Purpose | Destination | Direction | Description |
|---------|-------------|-----------|-------------|
| Room Chat | `/topic/public/{roomId}` | Server → Client | Room-specific message broadcast |
| User Status | `/topic/status/{roomId}` | Server → Client | Join/leave notifications |
| Send Message | `/app/chat.sendMessage` | Client → Server | Send chat message |
| Join Room | `/app/chat.addUser` | Client → Server | User join notification |
| Leave Room | `/app/chat.removeUser` | Client → Server | User leave notification |
| Private Messages | `/queue/private/{userId}` | Server → Client | Future: Direct messages |
| Errors | `/user/queue/errors` | Server → Client | User-specific error messages |

## 📊 Data Models & API Specifications

### Core Message Schema
```typescript
interface ChatMessage {
  id: string;                    // UUID message identifier
  roomId: string;               // Target room UUID
  sender: string;               // Username (3-50 chars)
  content: string;              // Message content (1-1000 chars)
  type: MessageType;            // CHAT | JOIN | LEAVE | SYSTEM
  timestamp: Date;              // ISO 8601 timestamp
  metadata?: MessageMetadata;   // Optional tracking data
}

interface ChatRoom {
  id: string;                   // UUID room identifier  
  name: string;                 // Display name
  description?: string;         // Optional description
  createdAt: Date;             // Creation timestamp
  activeUsers: UserSession[];   // Current connections
  messageCount: number;         // Statistics counter
  isPrivate: boolean;          // Access control flag
}

interface UserSession {
  sessionId: string;           // WebSocket session ID
  username: string;            // Display identifier
  joinedAt: Date;             // Room join timestamp
  lastActivity: Date;         // Last message time
  isActive: boolean;          // Connection status
}
```

### REST API Endpoints
```yaml
# Room Management
GET    /api/rooms                     # List all rooms
POST   /api/rooms                     # Create new room
GET    /api/rooms/{id}                # Get room details
GET    /api/rooms/{id}/users          # List room users
DELETE /api/rooms/{id}                # Delete room (admin)

# Message History (Future)
GET    /api/rooms/{id}/messages       # Paginated message history
GET    /api/rooms/{id}/messages/search # Search messages

# User Management (Future)
GET    /api/users/profile             # User profile
PUT    /api/users/profile             # Update profile
GET    /api/users/{id}/status         # User online status
```

## 🗄️ Database Design (Future Persistence)

### Entity Relationship Model
```sql
-- Users table with authentication support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Chat rooms with access control
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT false,
    max_users INTEGER DEFAULT 100,
    room_code VARCHAR(20) UNIQUE
);

-- Message storage with partitioning support
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'CHAT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN DEFAULT false,
    reply_to_id UUID REFERENCES messages(id)
) PARTITION BY HASH (room_id);

-- Room membership tracking
CREATE TABLE room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(room_id, user_id) WHERE left_at IS NULL
);
```

## 🚀 Implementation Guidelines

### Spring Boot Backend Structure
```
src/main/java/com/chatapp/
├── WebSocketChatApplication.java      # Application entry point
├── config/
│   ├── WebSocketConfig.java           # WebSocket/STOMP configuration
│   ├── CorsConfig.java               # CORS policy setup
│   └── SecurityConfig.java           # Future: Authentication config
├── controller/
│   ├── ChatController.java           # WebSocket message handlers
│   └── RoomController.java           # REST API endpoints
├── service/
│   ├── ChatService.java              # Message processing logic
│   ├── RoomService.java              # Room management logic
│   └── UserSessionService.java       # Session tracking
├── model/
│   ├── ChatMessage.java              # Message entity
│   ├── ChatRoom.java                 # Room entity
│   └── UserSession.java              # Session entity
├── dto/
│   ├── ChatMessageDto.java           # Message validation
│   └── CreateRoomDto.java            # Room creation validation
└── repository/
    ├── MessageRepository.java        # Future: JPA repository
    └── RoomRepository.java           # Future: JPA repository
```

### NestJS Backend Structure
```
src/
├── main.ts                           # Application bootstrap
├── app.module.ts                     # Root module configuration
├── chat/
│   ├── chat.module.ts                # Chat domain module
│   ├── chat.gateway.ts               # WebSocket message handlers
│   ├── chat.service.ts               # Message processing logic
│   └── dto/
│       ├── chat-message.dto.ts       # Message validation schema
│       └── join-room.dto.ts          # Room join validation
├── rooms/
│   ├── rooms.module.ts               # Room management module
│   ├── rooms.service.ts              # Room business logic
│   ├── rooms.controller.ts           # REST API endpoints
│   └── interfaces/
│       └── room.interface.ts         # TypeScript interfaces
├── users/
│   ├── users.module.ts               # User management module
│   └── users.service.ts              # Session tracking logic
├── common/
│   ├── filters/
│   │   └── ws-exception.filter.ts    # WebSocket error handling
│   ├── guards/
│   │   ├── ws-throttle.guard.ts      # Rate limiting protection
│   │   └── ws-auth.guard.ts          # Future: Authentication guard
│   └── interceptors/
│       └── ws-logging.interceptor.ts # Request/response logging
└── config/
    ├── database.config.ts            # Future: Database configuration
    └── redis.config.ts               # Future: Redis configuration
```

## 🔒 Security Considerations

### Authentication & Authorization (Future)
- JWT-based session management
- Role-based access control (RBAC)
- Room-level permissions (admin, member, viewer)
- Session timeout and refresh token rotation

### Input Validation & Sanitization
- DTO validation with class-validator
- HTML/XSS sanitization for message content
- Username format validation (alphanumeric + underscore)
- Message length limits (1-1000 characters)

### Rate Limiting & DoS Protection
- Per-user message rate limiting (30 messages/minute)
- Connection throttling (max 5 connections per IP)
- Room size limits (100 users default)
- Automatic cleanup of inactive sessions

### Data Protection
- Password hashing with bcrypt (cost factor 12)
- Sensitive data encryption at rest
- Secure WebSocket connections (WSS in production)
- Input parameter sanitization

## 📈 Scalability & Performance Design

### Horizontal Scaling Strategy
- Stateless backend services for load balancing
- Redis Cluster for session storage and message brokering
- Database read replicas for message history queries
- CDN integration for static assets

### Caching Strategy
- Redis for active user sessions (TTL: 30 minutes)
- In-memory caching for room metadata (TTL: 5 minutes)
- Browser caching for static resources
- Application-level caching for user profiles

### Performance Optimization
- WebSocket connection pooling and reuse
- Message batching for high-volume rooms
- Database query optimization with proper indexing
- Async processing for non-critical operations

### Monitoring & Observability
- Real-time metrics: concurrent connections, message throughput
- Performance metrics: response times, error rates
- Business metrics: active users, room engagement
- Health check endpoints for load balancer integration

## 🛠️ Development & Deployment

### Development Environment Setup
```bash
# Spring Boot Backend
cd spring-boot-backend
./gradlew bootRun                    # Runs on localhost:8080

# NestJS Backend  
cd nestjs-backend
npm run start:dev                    # Runs on localhost:3001

# Frontend
cd frontend
npm run dev                          # Runs on localhost:3000
```

### Docker Configuration
```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  spring-boot:
    build: ./spring-boot-backend
    ports: ["8080:8080"]
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:5432/chatdb
      
  nestjs:
    build: ./nestjs-backend  
    ports: ["3001:3001"]
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:5432/chatdb
      
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
      
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: chatdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports: ["5432:5432"]
```

### Kubernetes Production Deployment
- Horizontal Pod Autoscaler (HPA) based on CPU/memory metrics
- Service mesh (Istio) for traffic management and security
- Persistent volumes for database storage
- ConfigMaps and Secrets for environment configuration
- Ingress controller with SSL termination

## 🧪 Testing Strategy

### Unit Testing
- Spring Boot: JUnit 5 + Mockito + TestContainers
- NestJS: Jest + Supertest for HTTP testing
- Frontend: Vitest + React Testing Library

### Integration Testing
- WebSocket connection and message flow testing
- Database integration testing with test containers
- API endpoint testing with real HTTP requests
- Cross-browser compatibility testing

### Load Testing
- WebSocket concurrent connection testing (target: 1000+ users)
- Message throughput testing (target: 100 messages/second)
- Database performance under load
- Memory leak detection during extended usage

## 🔄 Future Enhancements Roadmap

### Phase 2: Enhanced Features
- User authentication with JWT
- Message persistence and history
- Private messaging capabilities
- File upload and sharing
- Message reactions and threading

### Phase 3: Advanced Capabilities
- Video/audio calling integration
- Message encryption (E2E)
- Advanced moderation tools
- Multi-language support
- Mobile app development

### Phase 4: Enterprise Features
- Multi-tenant architecture
- Advanced analytics and reporting
- Integration with external services
- Advanced security features
- High availability deployment

---

**Document Version**: 1.0  
**Last Updated**: August 27, 2024  
**Authors**: System Architecture Team  
**Status**: Design Complete - Ready for Implementation