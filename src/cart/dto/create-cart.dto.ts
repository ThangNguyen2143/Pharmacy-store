export type Money = {
  value: number;
  currencyCode: string;
};
export type CartProduct = {
  id: number;
  title: string;
  unit: string;
  urlImage: string;
};
export type CartItem = {
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  product: CartProduct;
};
export class CreateCartDto {
  totalQuantity: number;
}
