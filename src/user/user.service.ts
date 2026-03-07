import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import ResponseHelper from 'src/untils/helper/ResponseModel';
import { DeviceInfo } from './dto/device-info';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}
  private TIME_EXPIRE_REFRESH = 7 * 24 * 60 * 60 * 1000; // 7d
  private TIME_EXPIRE_SESSION = 14 * 24 * 60 * 60 * 1000; // 14d
  async createUser(CreateUserDto: CreateUserDto) {
    const userFoundByPhone = await this.findByPhone(CreateUserDto.phone);
    if (userFoundByPhone) {
      return ResponseHelper.ResponseConflict('Người dùng đã tồn tại');
    }
    const userFoundByEmail = await this.findByEmail(CreateUserDto.email);
    if (userFoundByEmail) {
      return ResponseHelper.ResponseConflict('Email đã được sử dụng');
    }
    await this.db.user.create({
      data: {
        ...CreateUserDto,
        role: CreateUserDto.role || 'customer',
        password: await this.hashPassword(CreateUserDto.password),
      },
    });
    // const { password, ...result } = newUser;
    // return result;
    return ResponseHelper.ResponseSuccess('');
  }
  async findByEmail(email?: string) {
    return email
      ? this.db.user.findUnique({
          where: {
            email,
          },
        })
      : null;
  }
  async findByPhone(phone?: string) {
    return phone
      ? this.db.user.findUnique({
          where: {
            phone,
          },
        })
      : null;
  }
  async findById(id: number) {
    return this.db.user.findUnique({ where: { id } });
  }
  async changePassword(userId: number, newPassword: string) {
    if (!userId || !newPassword) {
      return [false, 'Thiếu tham số'];
    }
    const hashNewPassword = await this.hashPassword(newPassword);
    const userAfterUpdate = await this.db.user.update({
      where: { id: userId },
      data: { password: hashNewPassword },
    });
    if (userAfterUpdate) {
      return [true, 'Đổi mật khẩu thành công'];
    }
    return [false, 'Đổi mật khẩu thất bại'];
  }
  hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(null);
        }
        bcrypt.hash(password, salt, (err2, hash) => {
          return err2 ? reject(null) : resolve(hash);
        });
      });
    });
  }
  checkPassword(userPassword: string, password: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, userPassword, (error, ok) => {
        return error || !ok ? resolve(false) : resolve(true);
      });
    });
  }
  // create new session when user login
  async createOrUpdateSession(userId: number, deviceInfo: DeviceInfo) {
    const deviceId = deviceInfo.deviceId;
    if (!deviceId || userId === undefined) {
      return {
        type: 'error',
        sessionId: null,
      };
    }
    // nếu cùng deviceId login lại, update session hiện tại.
    const existingSession = await this.db.session.findFirst({
      where: {
        userId,
        dataDevice: {
          path: ['deviceId'],
          equals: deviceId,
        },
      },
    });
    // Nếu tồn tại session với deviceId này, update lại thời gian hết hạn, revoked refresh_token đang active, nếu không thì tạo mới session
    if (existingSession) {
      await this.revokeAllRefreshTokensOfSession(existingSession.id);
      const sesionUpdated = await this.db.session.update({
        where: { id: existingSession.id },
        data: {
          refreshAt: new Date(),
          revokedAt: null,
          expires: new Date(new Date().getTime() + this.TIME_EXPIRE_SESSION),
          dataDevice: deviceInfo,
        },
      });
      return {
        type: 'update',
        sessionId: sesionUpdated.id,
      };
    }
    const newSession = await this.db.session.create({
      data: {
        expires: new Date(new Date().getTime() + this.TIME_EXPIRE_SESSION),
        dataDevice: deviceInfo,
        userId,
      },
    });
    return {
      type: 'create',
      sessionId: newSession.id,
    };
  }
  // Get Session by userId and deviceId, check if session exist and not expired, if exist return session, if not return null
  async getSessionByUserIdAndDeviceId(userId: number, deviceId: string) {
    if (!deviceId || userId === undefined) {
      return null;
    }
    const session = await this.db.session.findFirst({
      where: {
        userId,
        dataDevice: {
          path: ['deviceId'],
          equals: deviceId,
        },
        expires: {
          gt: new Date(),
        },
      },
    });
    return session
      ? { ...session, dataDevice: session.dataDevice as DeviceInfo }
      : null;
  }
  // Get many session by userId, check if session exist and null if not exist, if exist return session list
  async getSessionsByUserId(userId: number) {
    if (userId === undefined) {
      return null;
    }
    const sessions = await this.db.session.findMany({
      where: {
        userId,
      },
    });
    return sessions.length > 0
      ? sessions.map((session) => ({
          ...session,
          dataDevice: session.dataDevice as DeviceInfo,
        }))
      : null;
  }
  /**
   * @description Revoke session của user theo deviceId,
   * khi user đăng xuất thì revoke session hiện tại để ngăn chặn việc sử dụng refresh token để lấy access token mới
   * @param userId ID người dùng
   * @param deviceId ID thiết bị
   * @returns boolean
   *  Lí do chỉ revoke session mà không xóa hẳn là để lưu lại lịch sử đăng nhập của user,
   * nếu xóa hẳn thì sẽ không biết được user đã từng đăng nhập bằng những thiết bị nào, nếu
   * revoke thì vẫn có thể lưu lại thông tin thiết bị nhưng không cho phép sử dụng refresh
   * token để lấy access token mới, khi user đăng xuất thì revoke session hiện tại để ngăn
   * chặn việc sử dụng refresh token để lấy access token mới, nếu user muốn đăng nhập lại
   * thì phải đăng nhập lại để tạo session mới và refresh token mới
   */
  async revokeSession(userId: number, deviceId: string) {
    const session = await this.getSessionByUserIdAndDeviceId(userId, deviceId);
    if (session) {
      await this.revokeAllRefreshTokensOfSession(session.id);
      await this.db.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      return true;
    }
    return false;
  }
  //Save refresh token to database
  async saveRefreshToken(
    refreshToken: string,
    tokenId: string,
    userId: number,
    deviceInfo: DeviceInfo,
  ): Promise<[boolean, string]> {
    const expireDate = new Date(
      new Date().getTime() + this.TIME_EXPIRE_REFRESH,
    );
    if (!tokenId || !refreshToken) {
      return [false, 'Token ID và Refresh Token là bắt buộc'];
    }
    const session = await this.createOrUpdateSession(userId, deviceInfo);
    if (session.type === 'error' || !session.sessionId) {
      return [false, 'Lỗi tạo session'];
    }
    const newRefreshTokenRecord = await this.db.refreshToken.create({
      data: {
        refreshToken: await this.hashPassword(refreshToken),
        userId,
        sessionId: session.sessionId,
        id: tokenId,
        expires: expireDate,
      },
    });
    return [true, expireDate.toLocaleDateString()];
  }
  // Hàm kiểm tra refresh token của user theo sessionId, nếu không tồn tại, đã hết hạn  thì trả về lỗi hoặc đã bị revoke thì trả về lỗi, nếu hợp lệ thì trả về true
  async verifyRefreshToken(
    refreshToken: string,
    tokenId: string,
  ): Promise<{ valid: boolean; revoked: boolean }> {
    if (!tokenId || !refreshToken) {
      return { valid: false, revoked: false };
    }
    const token = await this.db.refreshToken.findFirst({
      where: {
        id: tokenId,
      },
    });
    if (!token || token.expires < new Date()) {
      return { valid: false, revoked: false };
    }
    if (token.revoked) {
      return { valid: false, revoked: true };
    }
    return {
      valid: await this.checkPassword(token.refreshToken, refreshToken),
      revoked: false,
    };
  }
  // Hàm revoke tất cả refresh token của session khi user đăng xuất hoặc khi user đăng nhập lại bằng cùng deviceId để ngăn chặn việc sử dụng refresh token cũ để lấy access token mới
  async revokeAllRefreshTokensOfSession(sessionId: number) {
    await this.db.refreshToken.updateMany({
      where: {
        sessionId,
      },
      data: {
        revoked: true,
      },
    });
  }
}
