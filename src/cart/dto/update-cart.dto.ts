export class UpdateCartDto {
  lines: [
    {
      quantity?: number;
      productId: number;
    },
  ];
}
