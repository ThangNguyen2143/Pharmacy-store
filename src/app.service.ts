import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Pharmacy Management System API!';
  }
}
