import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import {
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Tên đăng nhập của người dùng',
  })
  @IsNotEmpty()
  @MaxLength(100)
  readonly username: string;
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email của người dùng',
  })
  @IsEmail()
  @IsOptional()
  readonly email?: string;
  @ApiProperty({
    example: '0123456789',
    description: 'Số điện thoại của người dùng',
  })
  @IsNotEmpty()
  @MaxLength(15)
  readonly phone: string;
  @ApiProperty({ example: 'P@ssw0rd', description: 'Mật khẩu của người dùng' })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(48)
  readonly password: string;
  @ApiProperty({ example: 'customer', description: 'Vai trò của người dùng' })
  @IsEnum(Role)
  readonly role?: Role;
}
