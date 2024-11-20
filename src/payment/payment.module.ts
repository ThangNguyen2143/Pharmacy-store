import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { VnpayModule } from 'nestjs-vnpay';
import { PaymentController } from './payment.controller';
import { DatabaseService } from 'src/database/database.service';
@Module({
  imports: [
    VnpayModule.register({
      tmnCode: process.env.VNP_TMNCODE,
      secureSecret: process.env.VNP_HASHSECRET,
      vnpayHost: process.env.VNP_URL,
      testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
      enableLog: true, // tùy chọn
    }),
  ],
  providers: [PaymentService, DatabaseService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
