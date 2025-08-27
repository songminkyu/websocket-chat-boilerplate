import { IsNotEmpty, IsString, Length, IsOptional, IsBoolean } from 'class-validator';

/**
 * Data Transfer Object for creating chat rooms
 * 
 * Validates room creation requests from REST API clients
 * and ensures proper room configuration.
 */
export class CreateRoomDto {
  @IsNotEmpty({ message: 'Room name is required' })
  @IsString({ message: 'Room name must be a string' })
  @Length(3, 100, { message: 'Room name must be between 3 and 100 characters' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Room description must be a string' })
  @Length(0, 500, { message: 'Room description must not exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPrivate must be a boolean' })
  isPrivate?: boolean = false;
}

/**
 * DTO for updating room information
 */
export class UpdateRoomDto {
  @IsOptional()
  @IsString({ message: 'Room name must be a string' })
  @Length(3, 100, { message: 'Room name must be between 3 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Room description must be a string' })
  @Length(0, 500, { message: 'Room description must not exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isPrivate must be a boolean' })
  isPrivate?: boolean;
}