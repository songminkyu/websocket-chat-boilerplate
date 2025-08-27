import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * Data Transfer Object for chat messages
 * 
 * Validates incoming message data from WebSocket clients
 * and ensures data integrity before processing.
 */
export class ChatMessageDto {
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsString({ message: 'Room ID must be a string' })
  roomId: string;

  @IsNotEmpty({ message: 'Sender is required' })
  @IsString({ message: 'Sender must be a string' })
  @Length(3, 50, { message: 'Sender must be between 3 and 50 characters' })
  sender: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @Length(1, 1000, { message: 'Content must be between 1 and 1000 characters' })
  content: string;
}

/**
 * DTO for user join/leave operations
 */
export class JoinRoomDto {
  @IsNotEmpty({ message: 'Room ID is required' })
  @IsString({ message: 'Room ID must be a string' })
  roomId: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  sender: string;
}