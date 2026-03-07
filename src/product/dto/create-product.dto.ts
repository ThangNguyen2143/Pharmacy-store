import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Tên sản phẩm',
  })
  @IsNotEmpty()
  name: string;
  @ApiProperty({
    description: 'Đơn vị tính của sản phẩm',
  })
  @IsNotEmpty()
  unit: string;
  @ApiProperty({
    description: 'Giá của sản phẩm',
  })
  @IsNotEmpty()
  price: number;
  @ApiProperty({
    description: 'Mã sản phẩm nội bộ',
  })
  @IsNotEmpty()
  sku: string;
  @ApiProperty({
    description: 'Loại mặt hàng',
  })
  @IsNotEmpty()
  typeProduct: string;
}
