# 🚀 WebSocket Chat Platform

A real-time chat platform boilerplate project with **dual backend support** (Spring Boot & NestJS) and a unified Next.js frontend. Features WebSocket/STOMP protocol for seamless real-time bidirectional communication.

## 🏗️ Architecture Overview

```
websocket-chat/
├── spring-boot-backend/     # Java 17 + Spring Boot 3.x
├── nestjs-backend/          # Node.js 18+ + TypeScript + NestJS 10
└── frontend/               # Next.js 15+ + React + TypeScript
```

**Dual Backend Architecture**: Choose between Spring Boot (enterprise Java) or NestJS (modern TypeScript) backends, both implementing identical STOMP messaging protocols for seamless frontend integration.

## 🌟 Features

### Core Messaging
- **Real-time Communication**: WebSocket with STOMP protocol compatibility
- **Room Management**: Create, join, and manage chat rooms dynamically  
- **User Presence**: Track active users and their real-time status
- **Message Broadcasting**: Room-specific message delivery with low latency
- **System Notifications**: User join/leave events and status updates

### Security & Performance
- **Rate Limiting**: DoS protection with progressive penalties
- **Input Validation**: XSS sanitization and comprehensive data validation
- **CORS Protection**: Configurable origin whitelist for security
- **Error Recovery**: Auto-reconnection with exponential backoff
- **Thread Safety**: Concurrent user session management

### Developer Experience
- **Unified Frontend**: Single React client works with both backends
- **Hot Reload**: Development servers with instant feedback
- **Type Safety**: Full TypeScript support across all components
- **Modular Architecture**: Clean separation of concerns
- **Testing Ready**: Comprehensive test setup and configuration

## 🔧 Technology Stack

### Spring Boot Backend
- **Framework**: Spring Boot 3.1.5 + Java 17
- **WebSocket**: Spring WebSocket with STOMP messaging
- **Build**: Gradle 8.4 with dependency management
- **Validation**: Spring Boot Starter Validation
- **Monitoring**: Actuator for health checks and metrics

### NestJS Backend  
- **Framework**: NestJS 10+ + TypeScript + Node.js 18+
- **WebSocket**: Socket.IO with STOMP-compatible event handling
- **Validation**: Class-validator with comprehensive DTO validation
- **Security**: Rate limiting guards and XSS protection
- **Architecture**: Modular design with gateways, services, and guards

### Next.js Frontend
- **Framework**: Next.js 15+ with App Router + React 18+
- **WebSocket**: @stompjs/stompjs with SockJS fallback
- **Styling**: Tailwind CSS for responsive design
- **Testing**: Vitest + Testing Library for comprehensive coverage
- **Icons**: Lucide React for modern iconography

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **pnpm**: 8.0.0 or higher  
- **Java**: JDK 17 or higher (for Spring Boot)
- **Gradle**: 8.4 or higher (wrapper included)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd websocket-chat
```

### 2. Choose Your Backend

#### Option A: Spring Boot Backend
```bash
cd spring-boot-backend
./gradlew bootRun
# Server runs on http://localhost:8080
```

#### Option B: NestJS Backend  
```bash
cd nestjs-backend
pnpm install
pnpm run start:dev
# Server runs on http://localhost:3001
```

### 3. Start Frontend
```bash
cd frontend
pnpm install
pnpm run dev
# Client runs on http://localhost:3000
```

### 4. Open Application
Navigate to `http://localhost:3000` to start chatting!

## 📡 API Specifications

### WebSocket Endpoints

#### Spring Boot Backend (`ws://localhost:8080/ws`)
| Event | Direction | Description |
|-------|-----------|-------------|
| **CONNECT** | Client → Server | Establish WebSocket connection |
| **SUBSCRIBE** | Client → Server | `/topic/public/{roomId}` - Subscribe to room |
| **SEND** | Client → Server | `/app/chat.sendMessage` - Send message |
| **SEND** | Client → Server | `/app/chat.addUser` - Join room notification |

#### NestJS Backend (`ws://localhost:3001`)
| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | Establish Socket.IO connection |
| `chat.addUser` | Client → Server | User joins room |
| `chat.sendMessage` | Client → Server | Send chat message |
| `message` | Server → Client | Broadcast message to room |
| `userStatus` | Server → Client | User join/leave notifications |

### REST API Endpoints

Both backends provide identical REST APIs:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/rooms` | List all chat rooms |
| `POST` | `/api/rooms` | Create new room |
| `GET` | `/api/rooms/{id}` | Get room details |
| `PUT` | `/api/rooms/{id}` | Update room |
| `DELETE` | `/api/rooms/{id}` | Delete room |
| `GET` | `/api/rooms/{id}/users` | Get room users |
| `GET` | `/health` | Health check endpoint |

### Message Payload Formats

#### Chat Message
```json
{
  "roomId": "room-uuid",
  "sender": "username",
  "content": "Hello, World!",
  "type": "CHAT",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### User Join/Leave
```json
{
  "roomId": "room-uuid", 
  "sender": "username",
  "type": "JOIN|LEAVE",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 🔒 Security Features

### Rate Limiting
- **Spring Boot**: Custom interceptors with request throttling
- **NestJS**: WebSocket throttle guards with progressive penalties
- **Thresholds**: 30 messages/minute per user, 5 room operations/minute

### Input Validation  
- **XSS Protection**: HTML sanitization and content filtering
- **Data Validation**: Comprehensive DTO validation with type checking
- **CORS Configuration**: Strict origin whitelist and method restrictions

### Error Handling
- **Secure Messages**: No sensitive data exposure in error responses
- **Graceful Degradation**: Fallback mechanisms for WebSocket failures
- **Logging**: Comprehensive security event logging and monitoring

## 🧪 Development

### Running Tests

#### Spring Boot
```bash
cd spring-boot-backend
./gradlew test                    # Run unit tests
./gradlew integrationTest         # Run integration tests
./gradlew jacocoTestReport        # Generate coverage report
```

#### NestJS
```bash
cd nestjs-backend
pnpm run test                      # Run unit tests  
pnpm run test:e2e                  # Run end-to-end tests
pnpm run test:cov                  # Generate coverage report
```

#### Frontend
```bash
cd frontend
pnpm run test                      # Run unit tests
pnpm run test:ui                   # Run tests with UI
pnpm run test:coverage             # Generate coverage report
```

### Code Quality

#### Spring Boot
```bash
./gradlew checkstyleMain          # Code style validation
./gradlew spotbugsMain            # Static analysis
./gradlew dependencyUpdates       # Dependency vulnerability scan
```

#### NestJS  
```bash
pnpm run lint                      # ESLint validation
pnpm run format                    # Prettier formatting
pnpm audit                         # Security vulnerability scan
```

#### Frontend
```bash
pnpm run lint                      # Next.js + ESLint validation  
pnpm run type-check                # TypeScript compilation check
pnpm audit                         # Dependency security scan
```

## 🚀 Production Deployment

### Docker Support

#### Spring Boot
```dockerfile
FROM eclipse-temurin:17-jre-alpine
COPY build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### NestJS
```dockerfile  
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod --frozen-lockfile
COPY dist ./dist
EXPOSE 3001
CMD ["pnpm", "run", "start:prod"]
```

#### Frontend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod --frozen-lockfile
COPY .next/standalone ./
COPY .next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Build Commands

#### Production Builds
```bash
# Spring Boot
cd spring-boot-backend && ./gradlew bootJar

# NestJS  
cd nestjs-backend && pnpm run build

# Frontend
cd frontend && pnpm run build
```

#### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
    
  backend:
    build: ./nestjs-backend  # or ./spring-boot-backend
    ports: ["3001:3001"]
    environment:
      - NODE_ENV=production
      - PORT=3001
```

## 📊 Performance & Monitoring

### Health Checks
```bash
# Spring Boot
curl http://localhost:8080/actuator/health

# NestJS
curl http://localhost:3001/health

# Frontend  
curl http://localhost:3000/api/health
```

### Monitoring Metrics
- **WebSocket Connections**: Active connection count and session duration
- **Message Throughput**: Messages per second and delivery latency
- **Error Rates**: Connection failures and message delivery errors
- **Resource Usage**: Memory consumption and CPU utilization

## 🔄 Backend Switching

The frontend is designed to work seamlessly with either backend:

### Configuration
```typescript
// frontend/lib/constants.ts
export const WEBSOCKET_CONFIG = {
  SPRING_BOOT: 'ws://localhost:8080/ws',
  NESTJS: 'ws://localhost:3001',
  // Switch between backends by changing the active URL
  ACTIVE: 'ws://localhost:3001' // Currently using NestJS
};
```

### Protocol Compatibility
Both backends implement identical STOMP-compatible messaging:
- **Spring Boot**: Native STOMP over WebSocket
- **NestJS**: Socket.IO events mapped to STOMP destinations
- **Frontend**: Unified @stompjs/stompjs client interface

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow code style and testing guidelines
4. Commit changes: `git commit -m 'feat: add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request with detailed description

### Code Standards
- **Java**: Google Java Style Guide + Checkstyle
- **TypeScript**: ESLint + Prettier configuration  
- **Testing**: Minimum 80% unit test coverage
- **Documentation**: Comprehensive API documentation and code comments

## 🆘 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check port usage
lsof -ti:8080 | xargs kill -9    # Kill Spring Boot
lsof -ti:3001 | xargs kill -9    # Kill NestJS  
lsof -ti:3000 | xargs kill -9    # Kill Next.js
```

#### WebSocket Connection Issues
- Verify backend server is running and accessible
- Check CORS configuration in backend settings
- Confirm WebSocket URL matches backend endpoint
- Review browser console for connection error details

#### Build Failures
```bash
# Spring Boot - Clean and rebuild
./gradlew clean build --refresh-dependencies

# NestJS - Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml && pnpm install

# Frontend - Clear Next.js cache
rm -rf .next node_modules && pnpm install
```

### Debug Mode

#### Spring Boot
```bash
./gradlew bootRun --debug-jvm
# Connect debugger to port 5005
```

#### NestJS
```bash
pnpm run start:debug
# Connect debugger to port 9229
```

#### Frontend
```bash
pnpm run dev
# Debug in browser DevTools
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏷️ Version History

- **v1.0.0**: Initial release with dual backend support
- **Features**: WebSocket/STOMP messaging, room management, user presence
- **Backends**: Spring Boot 3.1.5 + NestJS 10+
- **Frontend**: Next.js 15+ with TypeScript

## 📞 Support

- **Documentation**: Check README sections and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues  
- **Discussions**: Join community discussions for questions and ideas
- **Security**: Report vulnerabilities privately via GitHub Security tab

---

**🎯 Ready to build your real-time chat application? Choose your preferred backend and start coding!**