import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  /**
   * access token
   */
  @ApiProperty({ type: 'string', description: 'Id thiết bị' })
  @IsNotEmpty()
  readonly deviceId: string;
}
