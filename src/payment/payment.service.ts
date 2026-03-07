import { Injectable } from '@nestjs/common';
import { response } from 'express';
import { VnpayService } from 'nestjs-vnpay';
import { DatabaseService } from 'src/database/database.service';
import {
  Bank,
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnInvalidAmount,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  ProductCode,
  VerifyReturnUrl,
  VnpLocale,
} from 'vnpay';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private db: DatabaseService,
  ) {}
  async getBankList() {
    const bankList: Bank[] = await this.vnpayService.getBankList();
    return bankList;
  }
  createdPaymentURL(orderInfor: {
    OrderId: string;
    Orderinfo: string;
    amount: number;
    ipAddress: string;
  }) {
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: orderInfor.amount,
      vnp_IpAddr: orderInfor.ipAddress || '13.160.92.202',
      vnp_TxnRef: orderInfor.OrderId,
      vnp_OrderInfo: orderInfor.Orderinfo,
      vnp_OrderType: ProductCode.Pharmacy_MedicalServices,
      vnp_ReturnUrl: process.env.VNP_RETURNURL,
      vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
    });
    return { paymentUrl };
  }
  async verifyReturn(query) {
    let verify: VerifyReturnUrl;
    try {
      // Sử dụng try-catch để bắt lỗi nếu query không hợp lệ, không đủ dữ liệu
      verify = await this.vnpayService.verifyReturnUrl(query);
      if (!verify.isVerified) {
        return {
          message: 'Xác thực tính toàn vẹn dữ liệu không thành công',
          type: 'Lỗi xác thực',
        };
      }
      if (!verify.isSuccess) {
        return { message: 'Thanh toán đã huỷ', type: 'Không thành công' };
      }
    } catch (e) {
      console.log(e);
      return { message: 'Dữ liệu không hợp lệ', type: 'Lỗi dữ liệu' };
    }

    // Kiểm tra thông tin đơn hàng và xử lý

    return { message: 'Đơn hàng thanh toán hoàn tất', type: 'Thành công' };
  }
  async verifyIpn(query) {
    try {
      const verify: VerifyReturnUrl =
        await this.vnpayService.verifyIpnCall(query);
      if (!verify.isVerified) {
        return IpnFailChecksum;
      }

      // Tìm đơn hàng trong database của bạn
      const foundOrder = await this.db.order.findUnique({
        where: { id: +verify.vnp_TxnRef },
      }); // Hàm tìm đơn hàng theo id

      // Nếu không tìm thấy đơn hàng hoặc mã đơn hàng không khớp
      if (!foundOrder || +verify.vnp_TxnRef !== foundOrder.id) {
        return response.json(IpnOrderNotFound);
      }

      // Nếu số tiền thanh toán không khớp
      if (verify.vnp_Amount !== foundOrder.Total) {
        return response.json(IpnInvalidAmount);
      }

      // Nếu đơn hàng đã được xác nhận trước đó
      if (foundOrder.osId === 6) {
        return response.json(InpOrderAlreadyConfirmed);
      }
      await this.db.order.update({
        where: { id: foundOrder.id },
        data: { osId: 6 },
      }); // Hàm cập nhật trạng thái đơn hàng
      return IpnSuccess;
    } catch (error) {
      /**
       * Xử lí lỗi ngoại lệ
       * Ví dụ như không đủ dữ liệu, dữ liệu không hợp lệ, cập nhật database thất bại
       */
      console.log(`verify error: ${error}`);
      return IpnUnknownError;
    }
  }
}
