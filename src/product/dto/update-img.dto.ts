import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateImgProductDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
  })
  @IsNotEmpty()
  product_id: number;
  @ApiProperty({
    description: 'Url hình ảnh',
  })
  @IsNotEmpty()
  url: string;
  @ApiProperty({
    description: 'Alt text của hình ảnh',
  })
  @IsNotEmpty()
  altText: string;
  @ApiProperty({
    description: 'Chiều rộng của hình ảnh',
  })
  @IsNotEmpty()
  width: number;
  @ApiProperty({
    description: 'Chiều cao của hình ảnh',
  })
  @IsNotEmpty()
  height: number;
  @ApiProperty({
    description: 'Loại hình ảnh',
  })
  @IsNotEmpty()
  type: string;
}
