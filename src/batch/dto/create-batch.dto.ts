import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({ description: 'Tên nhà cung cấp' })
  @IsNotEmpty()
  supplier_name: string;
  @ApiProperty({ description: 'Quốc gia' })
  @IsNotEmpty()
  nation: string;
  @ApiProperty({ description: 'Ngày hết hạn' })
  @IsNotEmpty()
  expire_date: Date;
  @ApiProperty({ description: 'Giá nhập' })
  @IsNotEmpty()
  import_price: number;
  @ApiProperty({ description: 'Ngày nhập' })
  @IsNotEmpty()
  import_date: Date;
  @ApiProperty({ description: 'ID sản phẩm' })
  @IsNotEmpty()
  productId: number;
  @ApiProperty({ description: 'Số lượng sản phẩm' })
  @IsNotEmpty()
  quantity: number;
}
