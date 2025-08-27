package com.chatapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object for creating chat rooms
 * 
 * Used for validating room creation requests from REST API clients
 * and ensuring proper room configuration.
 */
public class CreateRoomDto {
    
    @NotBlank(message = "Room name is required")
    @Size(min = 3, max = 100, message = "Room name must be between 3 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Room description must not exceed 500 characters")
    private String description;
    
    private boolean isPrivate = false;

    /**
     * Default constructor
     */
    public CreateRoomDto() {
    }

    /**
     * Constructor with parameters
     * 
     * @param name Display name of the room
     * @param description Optional room description
     * @param isPrivate Whether the room is private
     */
    public CreateRoomDto(String name, String description, boolean isPrivate) {
        this.name = name;
        this.description = description;
        this.isPrivate = isPrivate;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    @Override
    public String toString() {
        return "CreateRoomDto{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", isPrivate=" + isPrivate +
                '}';
    }
}