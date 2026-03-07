import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Mật khẩu hiện tại của người dùng',
  })
  @IsString({ message: 'Mật khẩu hiện tại phải là một chuỗi' })
  currentPassword: string;
  @ApiProperty({
    example: 'newPassword123',
    description:
      'Mật khẩu mới của người dùng, yêu cầu phải có độ dài tối thiểu 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt',
  })
  @MinLength(8, { message: 'Mật khẩu mới phải có độ dài tối thiểu 8 ký tự' })
  @IsString({ message: 'Mật khẩu mới phải là một chuỗi' })
  newPassword: string;
  @ApiProperty({
    example: 'device123',
    description: 'ID thiết bị của người dùng',
  })
  @IsString({ message: 'DeviceId phải là một chuỗi' })
  deviceId: string;
}
