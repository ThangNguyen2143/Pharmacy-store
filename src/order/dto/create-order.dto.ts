type line = {
  productId: number;
  quantity: number;
};
export class CreateOrderDto {
  total: number;
  addressRecive: string;
  typePay: string;
  nameRecive: string;
  phoneRecive: string;
  noteBill: string | undefined;
  cartId: number;
  lines: line[];
}
