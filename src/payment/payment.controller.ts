import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request } from 'express';

@Controller('/api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('get-vnp-url')
  createPaymentURL(
    @Query('orderid') orderId: string,
    @Query('orderinfo') orderInfo: string,
    @Query('total') amount: string,
    @Query('createAt') createAt: string,
  ) {
    const orderInfor = {
      OrderId: orderId,
      Orderinfo: orderInfo,
      amount: +amount,
      createAt: new Date(+createAt),
    };
    return this.paymentService.createdPaymentURL(orderInfor);
  }
  @Get('bank-list')
  bankList() {
    return this.paymentService.getBankList();
  }
  @Get('vnp-return')
  @Render('index')
  vnpReturn(@Req() request: Request) {
    return this.paymentService.verifyReturn(request.query);
  }
  @Get('vnp-ipn')
  ipnReturn(@Req() req: Request) {
    return this.paymentService.verifyIpn(req.query);
  }
}
