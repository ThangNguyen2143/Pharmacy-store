import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TypeProductService } from './type-product.service';
import { CreateTypeProductDto } from './dto/create-type-product.dto';
import { UpdateTypeProductDto } from './dto/update-type-product.dto';

@Controller('type-product')
export class TypeProductController {
  constructor(private readonly typeProductService: TypeProductService) {}

  @Post()
  create(@Body() createTypeProductDto: CreateTypeProductDto) {
    return this.typeProductService.create(createTypeProductDto);
  }

  @Get()
  findAll() {
    return this.typeProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeProductService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTypeProductDto: UpdateTypeProductDto,
  ) {
    return this.typeProductService.update(+id, updateTypeProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeProductService.remove(+id);
  }
}
