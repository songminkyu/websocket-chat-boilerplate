# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a real-time chat platform boilerplate project designed to provide dual backend support with Spring Boot and NestJS. The project uses WebSocket and STOMP (Simple Text Oriented Messaging Protocol) for real-time bidirectional communication.

**Current Status**: Planning/Documentation phase - actual implementation has not started yet.

## Architecture

The project follows a dual backend architecture:
- **Backend Option 1**: Spring Boot (Java 17+, Gradle)
- **Backend Option 2**: NestJS (Node.js 18+, TypeScript) 
- **Frontend**: Next.js 15+ (shared client for both backends)

Both backends run independently on different ports and use the same STOMP protocol for WebSocket communication.

## Planned Project Structure

```
├── spring-boot-backend/     # Spring Boot server
│   ├── src/
│   └── build.gradle
├── nestjs-backend/          # NestJS server  
│   ├── src/
│   └── package.json
└── frontend/                # Next.js 15+ client
    ├── app/
    └── package.json
```

## STOMP API Specifications

Based on the API spec document, the WebSocket communication uses these endpoints:

### Connection
- **CONNECT**: Client connects to WebSocket endpoint (`/ws` for Spring Boot)

### Subscription  
- **SUBSCRIBE**: `/topic/public/{roomId}` - Subscribe to specific chat room messages

### Message Sending
- **SEND**: `/app/chat.sendMessage` - Send chat messages
  - Payload: `{ "roomId": "...", "sender": "...", "content": "..." }`
- **SEND**: `/app/chat.addUser` - Notify user joined room  
  - Payload: `{ "roomId": "...", "sender": "..." }`

## Development Commands (When Implemented)

### Spring Boot Backend
```bash
cd spring-boot-backend
./gradlew bootRun               # Run on http://localhost:8080
./gradlew test                  # Run tests
./gradlew build                 # Build project
./gradlew bootBuildImage        # Build Docker image
```

### NestJS Backend  
```bash
cd nestjs-backend
npm install                     # Install dependencies
npm run start:dev               # Run development server
npm run test                    # Run tests
npm run build                   # Build for production
```

### Frontend (Next.js)
```bash
cd frontend  
npm install                     # Install dependencies
npm run dev                     # Run development server on http://localhost:3000
npm run build                   # Build for production
npm run test                    # Run tests
```

**Note**: NestJS and Next.js both use port 3000 by default - configure one to use a different port.

## Core Features to Implement

### Chat Room Management
- Create and list chat rooms
- Join/leave chat rooms  
- Room-specific message broadcasting

### Real-time Messaging
- WebSocket connection with STOMP protocol
- Real-time message delivery with low latency
- System messages for user join/leave events

### Message Flow
1. Client connects via WebSocket STOMP endpoint
2. Subscribe to `/topic/public/{roomId}` for specific room
3. Send user join via `/app/chat.addUser`  
4. Send messages via `/app/chat.sendMessage`
5. Receive broadcasts on subscribed topic

## Future Enhancement Areas

- JWT/session-based user authentication
- Message persistence (database integration)
- 1:1 direct messaging via `/queue` endpoints
- User presence/status management  
- External message broker (Redis Pub/Sub) for scaling
- Read receipts and message history
- File/image sharing capabilities

## Technical Considerations

- Both backends should implement identical STOMP message handling
- Frontend should be configurable to connect to either backend
- Port management for concurrent backend development
- CORS configuration for WebSocket connections
- Error handling and reconnection logic