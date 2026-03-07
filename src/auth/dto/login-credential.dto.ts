import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginCredential {
  /**
   * User email
   */
  @ApiProperty({ example: 'user@gmail.com', description: 'User email' })
  @IsOptional()
  readonly email: string;
  /**
   * User phone number
   * Example: 1234567890
   */
  @ApiProperty({ example: '1234567890', description: 'User phone number' })
  @IsOptional()
  readonly phone: string;
  /**
   * 4-12 char long password
   */
  @ApiProperty({
    example: 'password123',
    description: 'User password (4-12 characters)',
  })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(24)
  readonly password: string;
  @ApiProperty({
    example: 'abc-xyz-123',
    description: 'Device ID to identify the device that user is using',
  })
  @IsString()
  readonly deviceId: string;
}
