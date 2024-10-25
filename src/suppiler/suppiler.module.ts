import { Module } from '@nestjs/common';
import { SuppilerService } from './suppiler.service';
import { SuppilerController } from './suppiler.controller';

@Module({
  controllers: [SuppilerController],
  providers: [SuppilerService],
})
export class SuppilerModule {}
