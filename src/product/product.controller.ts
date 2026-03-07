import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UpdateImgProductDto } from './dto/update-img.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/api/product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @Get()
  findAll() {
    return this.productService.findAll();
  }
  @Get('active')
  GetAllProductActive() {
    return this.productService.findAllItemActive();
  }
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @Post(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @Post('/up-img')
  // @UseInterceptors(FileInterceptor('img'))
  updateImg(@Body() data: UpdateImgProductDto) {
    // return this.productService.updateImg(data);
    return this.productService.updateInfoImg(data);
  }
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
