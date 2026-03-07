import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginCredential } from './dto/login-credential.dto';
import { RefreshJwtGuard } from './guards/refresh.guard';
import { ApiBody } from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { SetAccessTokenHeaderInterceptor } from './auth.interceptor';
import { JwtGuard } from './guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiHeaders } from '@nestjs/swagger';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiBody({ type: CreateUserDto })
  async createNewUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('login')
  @UseInterceptors(SetAccessTokenHeaderInterceptor)
  async login(@Body() loginDto: LoginCredential, @Request() req: any) {
    try {
      return await this.authService.login(loginDto, req.headers['user-agent']);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @ApiHeaders([
    {
      name: 'authorization',
      description: 'Refresh token',
      required: true,
    },
  ])
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  @UseInterceptors(SetAccessTokenHeaderInterceptor)
  async refreshToken(@Body() data: { deviceId: string }, @Request() req: any) {
    return await this.authService.refreshToken(
      req.headers['authorization'],
      data.deviceId,
      req.headers['user-agent'],
    );
  }
  // Đăng xuất: Xóa refresh token của user theo sessionId
  // Chức năng có khả năng xóa session của user bất kì nếu có được thông tin userId và deviceId, nên cần phải bảo vệ route này bằng jwt guard để đảm bảo chỉ có user đã đăng nhập mới có thể gọi được API này, khi user đăng xuất thì revoke session hiện tại để ngăn chặn việc sử dụng refresh token để lấy access token mới, nếu user muốn đăng nhập lại thì phải đăng nhập lại để tạo session mới và refresh token mới
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Body() data: { userId: number; deviceId: string }) {
    return await this.authService.logout(data.userId, data.deviceId);
  }
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('change-password')
  async changePassword(
    @Body()
    data: ChangePasswordDto,
    @Request() req: any,
  ) {
    return await this.authService.changePassword(data, req.user.userId);
  }
}
