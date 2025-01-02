import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { LoginCredential } from './dto/login-credential.dto';
import { TokenDto } from './dto/token.dto';
import { user } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async register(AccountData: CreateUserDto) {
    return this.userService.createUser(AccountData);
  }
  async login(credential: LoginCredential) {
    const user = await this.userService.findByEmail(credential.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatched = await this.userService.checkPassword(
      user,
      credential.password,
    );

    if (!isMatched) {
      throw new Error('Invalid credentials');
    }
    return {
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
      },
      backendTokens: {
        accessToken: await this.jwtService.signAsync(
          { username: user.username, sub: { email: user.email } },
          {
            secret: process.env.JWT_SERECT,
            expiresIn: '60s',
          },
        ),
        refreshToken: await this.jwtService.signAsync(
          { username: user.username, sub: { email: user.email } },
          {
            secret: process.env.JWT_SERECT,
            expiresIn: '7d',
          },
        ),
        expiresIn: new Date().setTime(new Date().getTime() + 20 * 1000),
      },
    };
    // const authToken: TokenDto = this.generateAuthToken(user);
    // return authToken;
  }
  async refreshToken(user: any) {
    const payload = { username: user.username, sub: user.sub };
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '20s',
        secret: process.env.jwtSecretKey,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.jwtRefreshTokenKey,
      }),
      expiresIn: new Date().setTime(new Date().getTime() + 20 * 1000),
    };
  }
  private generateAuthToken(user: user): TokenDto {
    const accessToken = this.jwtService.sign({
      sub: () => user.username,
      type: 'access',
      roles: user.role,
      userId: user.id,
    });

    const refreshToken = this.jwtService.sign({
      sub: () => user.username,
      type: 'refresh',
      userId: user.id,
    });

    return { accessToken, refreshToken };
  }
}
