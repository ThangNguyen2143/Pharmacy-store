import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DatabaseService } from 'src/database/database.service';
import { PdfService } from 'src/pdf/pdf.service';
import { orderDetail } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private db: DatabaseService,
    private pdf: PdfService,
  ) {}
  async create(createOrderDto: CreateOrderDto) {
    const newOrder = await this.db.order.create({
      data: {
        AddressRecive: createOrderDto.addressRecive,
        Total: createOrderDto.total,
        TypePay: createOrderDto.typePay,
        NameRecive: createOrderDto.nameRecive,
        PhoneRecive: createOrderDto.phoneRecive,
        osId: 1,
        updatedAt: new Date(Date.now()),
      },
    });
    const decrementProduct = async (productId: number, quantity: number) => {
      const product = await this.db.product.update({
        where: { id: productId },
        data: { stored: { decrement: quantity } },
      });
      if (!product) return undefined;
      return product;
    };
    const detailOrder: orderDetail[] = [];
    for (let index = 0; index < createOrderDto.lines.length; index++) {
      const { productId, quantity } = createOrderDto.lines[index];
      const res = await decrementProduct(productId, quantity);
      if (!res) return new BadRequestException();
      const newItem = await this.db.orderDetail.create({
        data: {
          productId,
          quantity,
          oderId: newOrder.id,
        },
      });
      if (!newItem) return new BadRequestException();
      detailOrder.push(newItem);
    }
    await this.db.cart.update({
      where: { id: createOrderDto.cartId },
      data: {
        cartItem: { deleteMany: { cartId: createOrderDto.cartId } },
        totalQuantity: 0,
      },
    });
    return {
      ...newOrder,
      detail: detailOrder,
    };
  }

  async findAll() {
    return await this.db.order.findMany({
      include: { orderDetail: { include: { productSale: true } } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const updateOrder = await this.db.order.update({
      where: { id: id },
      data: { osId: updateOrderDto.osId },
      include: { orderDetail: true },
    });
    if (!updateOrder) return new BadRequestException();
    const { orderDetail, ...res } = updateOrder;

    return {
      ...res,
      detail: orderDetail,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
  async exportToPdf(id: number) {
    const order = await this.db.order.findUnique({
      where: { id },
      include: { orderDetail: { include: { productSale: true } } },
    });
    const reshapeDetail = order.orderDetail.map((item) => {
      return {
        'Sản phẩm': item.productSale.name,
        Giá: item.productSale.price,
        SL: item.quantity,
        'Thành tiền': item.quantity * item.productSale.price,
      };
    });
    await this.pdf.addText('HOÁ ĐƠN BÁN HÀNG', { x: 220 });
    await this.pdf.addText(`Số HD: ${order.id}`, { x: 240 });
    await this.pdf.addText(
      `Ngày ${order.createdAt.getDate()}, tháng ${order.createdAt.getMonth()}, năm ${order.createdAt.getFullYear()}`,
      { x: 180 },
    );
    // await this.pdf.addNewLine(); // Leave an empty Line
    await this.pdf.addText(`Khách hàng: ${order.NameRecive}`);
    // await this.pdf.addNewLine();
    await this.pdf.addText(`Sdt: ${order.PhoneRecive}`);
    await this.pdf.addNewLine();
    await this.pdf.addGenericTable(reshapeDetail, {
      tableName: 'Chi tiết hoá đơn',
    });
    await this.pdf.addNewLine();
    this.pdf.addText(`Tổng tiền hàng: ${order.Total - 15000}`, { x: 240 });
    this.pdf.addText(`Phí vận chuyển: 15000`, { x: 240 });
    await this.pdf.addText(`Tổng thanh toán: ${order.Total}`, { x: 240 });
    return (await this.pdf.render()).replace('./', '');
  }
}
