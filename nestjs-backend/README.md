# NestJS WebSocket Chat Backend

A real-time chat platform backend built with NestJS, Socket.IO, and TypeScript. This server provides WebSocket messaging with STOMP-compatible protocol for seamless integration with the Spring Boot backend.

## 🚀 Features

- **Real-time Messaging**: WebSocket/Socket.IO with STOMP protocol compatibility
- **Room Management**: Create, join, and manage chat rooms
- **User Presence**: Track active users and their activity
- **Rate Limiting**: Protect against spam and DoS attacks
- **Input Validation**: Comprehensive message and data validation
- **Error Handling**: Centralized error handling and logging
- **REST API**: Room management and statistics endpoints
- **Security**: Authentication guards and rate limiting (extensible)
- **Monitoring**: Health checks and performance metrics

## 🏗️ Architecture

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application bootstrap
├── chat/                      # WebSocket messaging module
│   ├── chat.gateway.ts        # Socket.IO message handlers
│   ├── chat.service.ts        # Message processing logic
│   └── dto/                   # Data validation schemas
├── rooms/                     # Room management module
│   ├── rooms.controller.ts    # REST API endpoints
│   ├── rooms.service.ts       # Room business logic
│   └── interfaces/            # TypeScript interfaces
├── users/                     # User session management
│   └── users.service.ts       # Session tracking logic
└── common/                    # Shared utilities
    ├── filters/               # Exception filters
    ├── guards/                # Auth and rate limiting
    └── interceptors/          # Logging and monitoring
```

## 📋 Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- TypeScript 5.x

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   cd nestjs-backend
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   pnpm run start:dev
   ```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `chat.sendMessage` | Client → Server | Send chat message |
| `chat.addUser` | Client → Server | User joins room |
| `chat.removeUser` | Client → Server | User leaves room |
| `message` | Server → Client | Broadcast message to room |
| `userStatus` | Server → Client | User join/leave notifications |
| `error` | Server → Client | Error messages |

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all chat rooms |
| POST | `/api/rooms` | Create new room |
| GET | `/api/rooms/:id` | Get room details |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| GET | `/api/rooms/:id/users` | Get room users |
| GET | `/api/rooms/system/stats` | System statistics |
| POST | `/api/rooms/system/cleanup` | Cleanup inactive users |
| GET | `/health` | Health check |

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=development          # Environment mode
PORT=3001                     # Server port
FRONTEND_URL=http://localhost:3000  # CORS origin
JWT_SECRET=your-jwt-secret    # Future: JWT authentication
THROTTLE_TTL=60              # Rate limiting window
THROTTLE_LIMIT=100           # Rate limiting count
```

### Rate Limiting

- **Messages**: 30 per minute per user
- **Room Operations**: 5 per minute per user
- **Penalties**: Progressive penalties for repeat offenders
- **Cleanup**: Automatic cleanup of tracking data

### CORS Policy

- Origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Credentials: Enabled

## 🧪 Testing

```bash
# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Run test coverage
pnpm run test:cov

# Watch mode
pnpm run test:watch
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### System Statistics
```bash
curl http://localhost:3001/api/rooms/system/stats
```

### Rate Limiting Stats
Available through the WsThrottleGuard service (programmatic access)

## 🔒 Security Features

### Current Implementation
- **Input Validation**: DTO validation with class-validator
- **Rate Limiting**: WebSocket message throttling
- **CORS Protection**: Configurable origin whitelist
- **Error Handling**: Secure error messages without sensitive data
- **Logging**: Comprehensive activity and security logging

### Future Enhancements
- **JWT Authentication**: Token-based user authentication
- **Room Permissions**: Fine-grained access control
- **Message Encryption**: End-to-end message encryption
- **Audit Logging**: Detailed security event logging

## 🚀 Deployment

### Development
```bash
pnpm run start:dev
```

### Production
```bash
pnpm run build
pnpm run start:prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "run", "start:prod"]
```

## 🔧 Development

### Code Style
- ESLint + Prettier configuration
- TypeScript strict mode
- Consistent naming conventions

### Debugging
```bash
npm run start:debug
```

### Linting
```bash
pnpm run lint
pnpm run format
```

## 📈 Performance

### Optimizations
- Connection pooling and reuse
- Efficient memory management
- Optimized JSON serialization
- Background cleanup processes

### Metrics
- WebSocket connection count
- Message throughput
- Response times
- Error rates

## 🤝 Integration

### Frontend Integration
The NestJS backend is designed to work seamlessly with:
- Next.js frontend (primary)
- Any STOMP-compatible client
- WebSocket/Socket.IO clients

### Backend Compatibility
- Compatible with Spring Boot STOMP protocol
- Shared message formats and destinations
- Consistent API responses

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

2. **CORS Errors**:
   - Verify `FRONTEND_URL` in `.env`
   - Check browser developer console

3. **WebSocket Connection Failed**:
   - Verify server is running
   - Check firewall settings
   - Review WebSocket proxy configuration

4. **Rate Limiting Issues**:
   - Check rate limiting configuration
   - Review client message frequency
   - Monitor penalties in logs

### Logs
Development logs include:
- WebSocket connections/disconnections
- Message processing
- Error details with stack traces
- Rate limiting events
- Security warnings

## 📝 License

MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review server logs
- Create an issue on GitHub