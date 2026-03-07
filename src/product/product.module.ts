import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { DatabaseService } from 'src/database/database.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ProductController],
  providers: [ProductService, DatabaseService, CloudinaryService, JwtService],
})
export class ProductModule {}
