import { Module } from '@nestjs/common';
import { TypeProductService } from './type-product.service';
import { TypeProductController } from './type-product.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [TypeProductController],
  providers: [TypeProductService, DatabaseService],
})
export class TypeProductModule {}
