package com.chatapp.controller;

import com.chatapp.dto.CreateRoomDto;
import com.chatapp.model.ChatRoom;
import com.chatapp.model.UserSession;
import com.chatapp.service.RoomService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * REST API controller for room management
 * 
 * Provides HTTP endpoints for:
 * - Room creation and listing
 * - Room details and user management
 * - System statistics and health checks
 */
@RestController
@RequestMapping("/api/rooms")
@Validated
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class RoomController {

    private static final Logger logger = LoggerFactory.getLogger(RoomController.class);
    
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Get all chat rooms
     * 
     * GET /api/rooms
     * 
     * @return List of all rooms with basic information
     */
    @GetMapping
    public ResponseEntity<Collection<ChatRoom>> getAllRooms() {
        try {
            Collection<ChatRoom> rooms = roomService.getAllRooms();
            logger.info("Retrieved {} rooms", rooms.size());
            return ResponseEntity.ok(rooms);
            
        } catch (Exception e) {
            logger.error("Error retrieving rooms: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new chat room
     * 
     * POST /api/rooms
     * 
     * @param createRoomDto Room creation data
     * @return Created room information
     */
    @PostMapping
    public ResponseEntity<ChatRoom> createRoom(@Valid @RequestBody CreateRoomDto createRoomDto) {
        try {
            ChatRoom room = roomService.createRoom(
                createRoomDto.getName(),
                createRoomDto.getDescription()
            );
            room.setPrivate(createRoomDto.isPrivate());
            
            logger.info("Created new room: {} (ID: {})", room.getName(), room.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(room);
            
        } catch (Exception e) {
            logger.error("Error creating room: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get room details by ID
     * 
     * GET /api/rooms/{id}
     * 
     * @param id Room identifier
     * @return Room details including active users
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getRoom(@PathVariable String id) {
        try {
            ChatRoom room = roomService.getRoom(id);
            
            if (room == null) {
                logger.warn("Room not found: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            logger.debug("Retrieved room details: {}", id);
            return ResponseEntity.ok(room);
            
        } catch (Exception e) {
            logger.error("Error retrieving room {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get users in a specific room
     * 
     * GET /api/rooms/{id}/users
     * 
     * @param id Room identifier
     * @return List of active users in the room
     */
    @GetMapping("/{id}/users")
    public ResponseEntity<Collection<UserSession>> getRoomUsers(@PathVariable String id) {
        try {
            if (!roomService.roomExists(id)) {
                logger.warn("Room not found for users request: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            Collection<UserSession> users = roomService.getRoomUsers(id);
            logger.debug("Retrieved {} users for room {}", users.size(), id);
            return ResponseEntity.ok(users);
            
        } catch (Exception e) {
            logger.error("Error retrieving users for room {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a room
     * 
     * DELETE /api/rooms/{id}
     * 
     * @param id Room identifier
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable String id) {
        try {
            boolean deleted = roomService.deleteRoom(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("deleted", deleted);
            response.put("roomId", id);
            
            if (deleted) {
                logger.info("Deleted room: {}", id);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Room not found for deletion: {}", id);
                response.put("message", "Room not found");
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error deleting room {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get system statistics
     * 
     * GET /api/rooms/stats
     * 
     * @return System-wide room and user statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        try {
            RoomService.RoomStats stats = roomService.getStats();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalRooms", stats.getTotalRooms());
            response.put("totalUsers", stats.getTotalUsers());
            response.put("totalMessages", stats.getTotalMessages());
            response.put("timestamp", System.currentTimeMillis());
            
            logger.debug("Retrieved system stats: {} rooms, {} users, {} messages",
                        stats.getTotalRooms(), stats.getTotalUsers(), stats.getTotalMessages());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving system stats: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     * 
     * GET /api/rooms/health
     * 
     * @return Service health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "websocket-chat-server");
        health.put("timestamp", System.currentTimeMillis());
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }

    /**
     * Cleanup inactive sessions (Admin endpoint)
     * 
     * POST /api/rooms/cleanup
     * 
     * @param inactiveMinutes Minutes of inactivity threshold (default: 30)
     * @return Cleanup results
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupInactiveSessions(
            @RequestParam(defaultValue = "30") long inactiveMinutes) {
        
        try {
            int cleanedUp = roomService.cleanupInactiveSessions(inactiveMinutes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("sessionsRemoved", cleanedUp);
            response.put("inactiveMinutes", inactiveMinutes);
            response.put("timestamp", System.currentTimeMillis());
            
            logger.info("Manual cleanup completed: {} sessions removed", cleanedUp);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error during manual cleanup: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Exception handler for validation errors
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationError(
            org.springframework.web.bind.MethodArgumentNotValidException e) {
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Validation failed");
        error.put("message", e.getBindingResult().getAllErrors().get(0).getDefaultMessage());
        error.put("timestamp", System.currentTimeMillis());
        
        logger.warn("Validation error: {}", error.get("message"));
        return ResponseEntity.badRequest().body(error);
    }
}