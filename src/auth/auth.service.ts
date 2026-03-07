import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginCredential } from './dto/login-credential.dto';
import { TokenDto } from './dto/token.dto';
import { User as UserModel } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import ResponseHelper from 'src/untils/helper/ResponseModel';
import { PayloadTokenDto } from './dto/payload-token.dto';
import { UAParser } from 'ua-parser-js';
import { DeviceInfo } from 'src/user/dto/device-info';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  private TIME_EXPIRE_ACCESS = 2 * 60 * 1000; // 2h
  private TIME_EXPIRE_REFRESH = 7 * 24 * 60 * 60 * 1000; // 7d
  async register(accountData: CreateUserDto) {
    return this.userService.createUser(accountData);
  }
  async login(credential: LoginCredential, userAgent: string = 'unknown') {
    const user = await this.findUserByRequest(credential);
    if (!user) {
      return ResponseHelper.ResponseData();
    }
    const isMatched = await this.userService.checkPassword(
      user.password,
      credential.password,
    );
    if (!isMatched) {
      return ResponseHelper.ResponseUnAuthorize();
    }
    const userData = {
      id: user.id,
      name: user.username,
      email: user.email,
      phone: user.phone,
    };
    const payloadToken: PayloadTokenDto = {
      jit: crypto.randomUUID(),
      sub: user.username,
      roles: user.role,
      userId: user.id,
    };
    const tokenData: TokenDto = await this.generateAuthToken(payloadToken);
    // Tính thời gian hết hạn của refresh token (7 ngày): theo định dạng dd/MM/yyyy HH:mm:ss
    const expireDate = new Date(
      new Date().setTime(new Date().getTime() + this.TIME_EXPIRE_REFRESH),
    ).toDateString();
    const deviceParserFromUserAgent = UAParser(userAgent);
    const deviceInfo = {
      deviceId: credential.deviceId || 'unknown',
      deviceType: deviceParserFromUserAgent.device.type || 'unknown',
      os: deviceParserFromUserAgent.os.name || 'unknown',
      browser: deviceParserFromUserAgent.browser.name || 'unknown',
    };
    const tokenSaved = await this.userService.saveRefreshToken(
      tokenData.refreshToken,
      payloadToken.jit,
      user.id,
      deviceInfo,
    );
    if (!tokenSaved) {
      return ResponseHelper.ResponseException('Lỗi kết nối server');
    }
    return ResponseHelper.GenerateResponse(
      200,
      'successful',
      'Xử lý thành công',
      {
        user: userData,
        refreshToken: tokenData.refreshToken,
        expiresIn: expireDate,
        accessToken: tokenData.accessToken,
      },
    );
  }
  async refreshToken(
    refreshToken: string,
    deviceId: string = 'unknown',
    userAgent: string = 'unknown',
  ) {
    const [type, tokenRefresh] = refreshToken?.split(' ') || [];
    if (type !== 'Refresh' || !tokenRefresh) {
      return ResponseHelper.ResponseUnAuthorize();
    }
    const userInfo = await this.decodeToken(tokenRefresh);
    if (!userInfo || userInfo.isExpired) {
      return ResponseHelper.ResponseUnAuthorize();
    }
    const { valid, revoked } = await this.userService.verifyRefreshToken(
      tokenRefresh,
      userInfo.user.jit,
    );
    if (!valid || revoked) {
      //Tạm thời chưa phân biệt được lỗi token hết hạn hay token bị revoke,
      // nếu token bị revoke thì xử lý revoke session hiện tại, cảnh báo người dùng và yêu cầu đăng nhập lại
      return ResponseHelper.ResponseUnAuthorize();
    }
    const payload: PayloadTokenDto = {
      jit: crypto.randomUUID(),
      sub: userInfo.user.username,
      roles: userInfo.user.role,
      userId: userInfo.user.userId,
    };
    const tokenData = await this.generateAuthToken(payload);
    const deviceParserFromUserAgent = UAParser(userAgent);
    const deviceInfo: DeviceInfo = {
      deviceId,
      deviceType: deviceParserFromUserAgent.device.type || 'unknown',
      os: deviceParserFromUserAgent.os.name || 'unknown',
      browser: deviceParserFromUserAgent.browser.name || 'unknown',
    };
    const [tokenSaved, expireDate] = await this.userService.saveRefreshToken(
      tokenData.refreshToken,
      payload.jit,
      userInfo.user.userId,
      deviceInfo,
    );
    if (!tokenSaved) {
      return ResponseHelper.ResponseException('Lỗi kết nối server');
    }
    return ResponseHelper.ResponseSuccess({
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.TIME_EXPIRE_ACCESS,
        secret: process.env.JWT_SECRET!,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.TIME_EXPIRE_REFRESH,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET!,
      }),
      expiresIn: expireDate,
    });
  }
  async logout(userId: number, deviceId: string) {
    const isRevoked = await this.userService.revokeSession(userId, deviceId);
    if (isRevoked) {
      return ResponseHelper.ResponseSuccess('Đăng xuất thành công');
    }
    return ResponseHelper.ResponseServer();
  }
  async changePassword(changePasswordDto: ChangePasswordDto, userId: number) {
    // Kiểm tra mật khẩu hiện tại có đúng không
    const user = await this.userService.findById(userId);
    if (!user) {
      return ResponseHelper.ResponseUnAuthorize();
    }
    const isMatched = await this.userService.checkPassword(
      user.password,
      changePasswordDto.currentPassword,
    );
    if (!isMatched) {
      return ResponseHelper.ResponseDataString('Mật khẩu hiện tại không đúng');
    }
    // Cập nhật mật khẩu mới
    const isUpdated = await this.userService.changePassword(
      userId,
      changePasswordDto.newPassword,
    );
    if (!isUpdated) {
      return ResponseHelper.ResponseServer();
    }
    // Revoke tất cả refresh token của session hiện tại để ngăn chặn việc sử dụng refresh token cũ để lấy access token mới sau khi đổi mật khẩu
    const sessions = await this.userService.getSessionsByUserId(userId);
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        if (session.dataDevice.deviceId === changePasswordDto.deviceId)
          continue; // Nếu deviceId trùng với deviceId của session hiện tại thì không revoke để tránh việc user vừa đổi mật khẩu xong mà bị đăng xuất ngay, nếu muốn đăng xuất thì user phải chủ động gọi API logout để revoke session hiện tại
        await this.userService.revokeSession(
          userId,
          session.dataDevice.deviceId,
        );
      }
    }
    return ResponseHelper.ResponseSuccess('Cập nhật mật khẩu thành công');
  }
  private async generateAuthToken(payload: any): Promise<TokenDto> {
    const optionsSign = (type: string) => {
      return {
        expiresIn:
          type === 'access'
            ? this.TIME_EXPIRE_ACCESS
            : this.TIME_EXPIRE_REFRESH,
        secret:
          type === 'access'
            ? process.env.JWT_SECRET!
            : process.env.JWT_REFRESH_TOKEN_SECRET!,
      };
    };
    const accessToken = await this.jwtService.signAsync(
      payload,
      optionsSign('access'),
    );

    const refreshToken = await this.jwtService.signAsync(
      payload,
      optionsSign('refresh'),
    );
    return { accessToken, refreshToken };
  }
  private async decodeToken(token: string) {
    if (!token) {
      return null;
    }
    const decoded = this.jwtService.decode(token) as {
      sub?: string;
      userId?: number;
      roles?: string;
      exp?: number;
      jit?: string;
    } | null;

    if (!decoded || typeof decoded !== 'object') {
      return null;
    }
    const isExpired = !decoded.exp || decoded.exp * 1000 <= Date.now();
    return {
      isExpired,
      user: {
        userId: decoded.userId ?? null,
        username: decoded.sub ?? null,
        role: decoded.roles ?? null,
        jit: decoded.jit ?? null,
      },
    };
  }
  private async findUserByRequest(
    credential: LoginCredential,
  ): Promise<UserModel | null> {
    if (credential.email) {
      return this.userService.findByEmail(credential.email);
    } else if (credential.phone) {
      return this.userService.findByPhone(credential.phone);
    }
    // Chưa kiểm được
    // account bị khóa/banned chưa
    // email/phone có yêu cầu verify không
    // bắt đổi mật khẩu không (password reset enforced)
    return null;
  }
}
