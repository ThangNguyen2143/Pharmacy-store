import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class CartService {
  constructor(private db: DatabaseService) {}
  async createNewCart(user: PayloadTokenDto) {
    const res = await this.db.cart.create({
      data: {
        totalQuantity: 0,
        checkoutUrl: '/payment/get-vnp-url',
        userId: user.userId,
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

  async getCartById(id: number) {
    const cart = await this.db.cart.findUnique({
      where: { id },
      include: {
        cartItem: { include: { product: { include: { mediaList: true } } } },
      },
    });
    if (!cart) return new BadRequestException();
    const mediaList = await this.db.media.findMany();
    const productList = await this.db.product.findMany({
      include: {
        batch: {
          include: {
            inventoryLot: true,
          },
        },
      },
    });
    //Check số lượng sản phẩm trong kho hiện tại có đủ để phục vụ cho giỏ hàng hay không, nếu không đủ sẽ cập nhật lại số lượng sản phẩm trong giỏ hàng bằng với số lượng sản phẩm còn lại trong kho
    cart.cartItem.forEach((item) => {
      const inventory = productList
        .find((product) => product.id === item.productId)
        ?.batch.reduce(
          (total, lot) =>
            total +
            lot.inventoryLot.reduce((sum, lot) => sum + lot.qty_on_hand, 0),
          0,
        );
      if (inventory !== undefined && item.quantity > inventory) {
        item.quantity = inventory;
        this.db.cartitem.update({
          where: {
            productId_cartId: { cartId: cart.id, productId: item.productId },
          },
          data: { quantity: inventory },
        });
      }
    });
    //Cập nhật lại tổng số lượng sản phẩm trong giỏ hàng
    const totalQuantity = cart.cartItem.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    await this.db.cart.update({
      where: { id: cart.id },
      data: { totalQuantity },
    });
    const listItem = this.listItem(cart.cartItem, mediaList);
    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: totalQuantity,
      lines: listItem,
    };
  }

  async update(
    id: number,
    dataUpdate: UpdateCartDto,
  ): Promise<CartResponse | BadRequestException> {
    //Tìm giỏ hàng
    const cart = await this.db.cart.findUnique({
      where: { id },
      include: {
        cartItem: {
          include: { product: { include: { mediaList: true } } },
        },
      },
    });
    if (!cart) return new BadRequestException();
    let res: CartResponse; //Định dạng kq trả về
    const mediaList = await this.db.media.findMany(); // Lấy danh sách hình ảnh
    dataUpdate.lines.forEach(async (line) => {
      const itemInCart = cart.cartItem.find(
        (item) => item.productId === line.productId,
      );
      if (itemInCart && line.quantity > 0) {
        const item = await this.updateItem(
          cart.id,
          line.productId,
          line.quantity,
        );
        const updateItem: CartItem = this.reshapeCartItem(
          item.quantity,
          itemInCart.product,
          mediaList,
        );
        res = {
          id: cart.id,
          checkoutUrl: 'something',
          lines: [
            ...this.listItem(cart.cartItem, mediaList).filter(
              (itemInCart) => itemInCart.product.id != line.productId,
            ),
            updateItem,
          ],
          totalQuantity: cart.totalQuantity + +line.quantity,
        };
      } else if (!itemInCart && line.quantity != undefined) {
        const item = await this.createNewItemInCart(
          cart.id,
          line.productId,
          line.quantity,
        );
        if (!item) return new BadRequestException();
        const addAnItem: CartItem = this.reshapeCartItem(
          item.quantity,
          item.product,
          mediaList,
        );
        res = {
          id: cart.id,
          lines: [...this.listItem(cart.cartItem, mediaList), addAnItem],
          checkoutUrl: '',
          totalQuantity: cart.totalQuantity + item.quantity,
        };
      } else if (itemInCart && !line.quantity) {
        const item = await this.removeItem(cart.id, +line.productId);
        const removeAnItem = {
          quantity: item.quantity,
        };
        const afterCart = await this.db.cart.update({
          where: { id: cart.id },
          data: { totalQuantity: { decrement: removeAnItem.quantity } },
          include: {
            cartItem: {
              include: { product: { include: { mediaList: true } } },
            },
          },
        });
        res = {
          id: cart.id,
          lines: this.listItem(afterCart.cartItem, mediaList),
          checkoutUrl: 'checkoutUrl',
          totalQuantity: afterCart.totalQuantity,
        };
      }
    });
    return res;
  }
  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
  async createNewItemInCart(
    cartId: number,
    productId: number,
    quantity: number = 1,
  ) {
    const existCart = await this.db.cart.findUnique({
      where: { id: cartId },
    });
    if (!existCart) return null;
    //Kiểm tra số lượng sản phẩm trong kho có đủ để thêm vào giỏ hàng hay không
    const product = await this.db.product.findUnique({
      where: { id: productId },
    });
    if (!product) return null;
    const inventory = await this.db.batch.findFirst({
      where: { productId },
      include: {
        inventoryLot: true,
      },
    });
    const availableQuantity = inventory.inventoryLot.reduce(
      (total, lot) => total + lot.qty_on_hand,
      0,
    );
    if (availableQuantity < quantity) {
      throw null;
    }
    existCart.totalQuantity += quantity;
    const newItemCart = await this.db.cartitem.create({
      data: {
        cartId,
        productId,
        quantity: quantity || 1,
      },
      include: { product: { include: { mediaList: true } } },
    });
    await this.db.cart.update({
      where: { id: cartId },
      data: { totalQuantity: existCart.totalQuantity },
    });
    return newItemCart;
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
      select: {
        quantity: true,
      },
    });
  }
  async removeItem(cartId: number, productId: number) {
    return await this.db.cartitem.delete({
      where: { productId_cartId: { cartId, productId } },
    });
  }
  reshapeCartItem(
    quantity: number,
    item: Product & { mediaList: ProductMedia[] },
    mediaList: Media[],
  ): CartItem {
    return {
      quantity,
      cost: {
        totalAmount: {
          value: quantity * item.price,
          currencyCode: 'VND',
        },
      },
      product: {
        id: item.id,
        title: item.name,
        unit: item.unit,
        urlImage:
          mediaList.find((img) => img.id === item.mediaList[0].mediaId)?.url ||
          null,
      },
    };
  }
  listItem(
    items: {
      quantity: number;
      product: Product & { mediaList: ProductMedia[] };
    }[],
    mediaList: Media[],
  ): CartItem[] {
    return items.map((item) => {
      return this.reshapeCartItem(item.quantity, item.product, mediaList);
    });
  }
}
import { Media, Product, ProductMedia } from '@prisma/client';
import { CartResponse } from './dto/cart-respone.dto';
import { CartItem } from './dto/create-cart.dto';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';
