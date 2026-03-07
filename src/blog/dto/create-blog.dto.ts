import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'Tiêu đề bài viết' })
  @IsNotEmpty()
  title: string;
  @ApiProperty({ example: 'Nội dung bài viết' })
  @IsNotEmpty()
  content: string;
  @ApiProperty({ example: 1, description: 'ID của tác giả' })
  @IsNotEmpty()
  authorId: number;
  @ApiProperty({ example: 'Danh sách hình ảnh minh họa' })
  @IsOptional()
  images?: string[];
}
