export type Money = {
  value: number;
  currencyCode: string;
};
export type CartProduct = {
  id: number;
  handle: string;
  title: string;
  unit: string;
  featuredImage: {
    url: string;
    altText: string;
    width: number;
    height: number;
  };
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
