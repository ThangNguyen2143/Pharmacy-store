import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseService } from 'src/database/database.service';
import { PdfService } from 'src/pdf/pdf.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, DatabaseService, PdfService],
})
export class OrderModule {}
