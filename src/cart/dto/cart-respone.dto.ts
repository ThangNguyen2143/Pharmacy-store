import { CartItem } from './create-cart.dto';

export type CartResponse = {
  id: number | undefined;
  checkoutUrl: string;
  lines: CartItem[];
  totalQuantity: number;
};
