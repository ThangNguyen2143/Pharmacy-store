import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class CartService {
  constructor(private db: DatabaseService) {}
  async create() {
    const res = await this.db.cart.create({
      data: {
        totalQuantity: 0,
        checkoutUrl: '/payment/get-vnp-url',
      },
    });
    return {
      ...res,
      lines: [],
    };
  }

  async findAll() {
    return await this.db.cart.findMany();
  }

  async findOne(id: number) {
    const cart = await this.db.cart.findUnique({
      where: { id },
      include: { cartItem: { include: { product: true } } },
    });
    if (!cart) return new BadRequestException();
    const mediaList = await this.db.media.findMany();
    const listItem = this.listItem({ CartItem: cart.cartItem, mediaList });
    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
      lines: listItem,
    };
  }

  async update(
    id: number,
    { lines }: UpdateCartDto,
  ): Promise<CartResponse | BadRequestException> {
    //Tìm giỏ hàng
    const cart = await this.db.cart.findUnique({
      where: { id },
      include: { cartItem: { include: { product: true } } },
    });
    if (!cart) return new BadRequestException();
    const mediaList = await this.db.media.findMany(); // Lấy danh sách hình ảnh
    let res: {
      id: number | undefined;
      checkoutUrl: string;
      lines: CartItem[];
      totalQuantity: number;
    }; //Định dạng kq trả về
    const itemInCart = cart.cartItem.find(
      (item) => item.productId === lines[0].productId,
    ); //Tìm sản phẩm trong giỏ hàng
    if (itemInCart && lines[0].quantity != undefined) {
      const item = await this.updateItem(
        cart.id,
        lines[0].productId,
        lines[0].quantity,
      );
      const updateItem: CartItem = {
        quantity: item.quantity,
        cost: {
          totalAmount: {
            value: item.quantity * item.product.price,
            currencyCode: 'VND',
          },
        },
        product: {
          id: item.productId,
          handle: item.product.handle,
          featuredImage: mediaList.find(
            (img) => img.productId === item.product.id,
          ),
          title: item.product.name,
          unit: item.product.unit,
        },
      };
      res = {
        id: cart.id,
        checkoutUrl: 'something',
        lines: [
          ...this.listItem({ CartItem: cart.cartItem, mediaList }).filter(
            (itemInCart) => itemInCart.product.id != item.productId,
          ),
          updateItem,
        ],
        totalQuantity: cart.totalQuantity + +lines[0].quantity,
      };
    } else if (!itemInCart && lines[0].quantity != undefined) {
      const item = await this.addItem(
        cart.id,
        lines[0].productId,
        lines[0].quantity,
      );
      const addAnItem: CartItem = {
        quantity: item.quantity,
        cost: {
          totalAmount: {
            value: item.quantity * item.product.price,
            currencyCode: 'VND',
          },
        },
        product: {
          id: item.productId,
          handle: item.product.handle,
          featuredImage: mediaList.find(
            (img) => img.productId === item.product.id,
          ),
          title: item.product.name,
          unit: item.product.unit,
        },
      };
      res = {
        id: cart.id,
        lines: [
          ...this.listItem({ CartItem: cart.cartItem, mediaList }),
          addAnItem,
        ],
        checkoutUrl: '',
        totalQuantity: cart.totalQuantity + item.quantity,
      };
    } else if (itemInCart && !lines[0].quantity) {
      const item = await this.removeItem(cart.id, +lines[0].productId);
      const removeAnItem = {
        quantity: item.quantity,
      };
      const afterCart = await this.db.cart.update({
        where: { id: cart.id },
        data: { totalQuantity: { decrement: removeAnItem.quantity } },
        include: { cartItem: { include: { product: true } } },
      });
      res = {
        id: cart.id,
        lines: this.listItem({ CartItem: afterCart.cartItem, mediaList }),
        checkoutUrl: 'checkoutUrl',
        totalQuantity: afterCart.totalQuantity,
      };
    }
    return res;
  }
  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
  async addItem(cartId: number, productId: number, quantity?: number) {
    await this.db.cart.update({
      where: { id: cartId },
      data: { totalQuantity: { increment: quantity ?? 1 } },
    });
    return await this.db.cartitem.create({
      data: {
        cartId,
        productId,
        quantity: quantity || 1,
      },
      include: {
        product: true,
      },
    });
  }
  async updateItem(cartId: number, productId: number, quantity: number) {
    await this.db.cart.update({
      where: { id: cartId },
      data: { totalQuantity: { increment: quantity } },
    });
    return await this.db.cartitem.update({
      where: { productId_cartId: { cartId, productId } },
      data: {
        quantity: { increment: quantity },
      },
      include: {
        product: true,
      },
    });
  }
  async removeItem(cartId: number, productId: number) {
    return await this.db.cartitem.delete({
      where: { productId_cartId: { cartId, productId } },
    });
  }
  listItem({
    CartItem,
    mediaList,
  }: {
    CartItem: { quantity: number; product: product }[];
    mediaList: media[];
  }) {
    return CartItem.map((item) => {
      const featuredImage = mediaList.find(
        (img) => img.productId === item.product.id,
      );
      return {
        quantity: item.quantity,
        cost: {
          totalAmount: {
            value: item.product.price * item.quantity,
            currencyCode: 'VND',
          },
        },
        product: {
          id: item.product.id,
          handle: item.product.handle,
          title: item.product.name,
          featuredImage,
          unit: item.product.unit,
        },
      };
    });
  }
}
import { media, product } from '@prisma/client';
import { CartResponse } from './dto/cart-respone.dto';
import { CartItem } from './dto/create-cart.dto';
