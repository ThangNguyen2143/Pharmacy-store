import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CartController],
  providers: [CartService, DatabaseService, JwtService],
})
export class CartModule {}
