import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DatabaseService } from 'src/database/database.service';
import { orderDetail } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private db: DatabaseService) {}
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

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
