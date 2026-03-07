import { Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BatchController } from './batch.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [BatchController],
  providers: [BatchService, DatabaseService, JwtService],
})
export class BatchModule {}
