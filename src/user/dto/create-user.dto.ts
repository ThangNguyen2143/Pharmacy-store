import { Role } from '@prisma/client';
import {
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(100)
  readonly username: string;
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  @MinLength(4)
  @MaxLength(24)
  readonly password: string;
  @IsEnum(Role)
  readonly role?: Role;
}
