import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { user } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}
  async createUser(CreateUserDto: CreateUserDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: CreateUserDto.email,
      },
    });
    if (user) throw new ConflictException('User already created');
    const newUser = await this.db.user.create({
      data: {
        ...CreateUserDto,
        role: CreateUserDto.role || 'customer',
        password: await this.hashPassword(CreateUserDto.password),
      },
    });
    const { password, ...result } = newUser;
    return result;
  }
  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return this.db.user.findUnique({ where: { id } });
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
  checkPassword(user: user, password: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (error, ok) => {
        return error || !ok ? resolve(false) : resolve(true);
      });
    });
  }
}
