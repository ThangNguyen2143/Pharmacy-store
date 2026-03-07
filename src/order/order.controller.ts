import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  StreamableFile,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller('/api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(@Query('query') query: string, @Query('state') state: string) {
    return this.orderService.findAll(query, +state);
  }
  @Get('/page')
  findOnPage(
    @Query('query') query: string,
    @Query('page') page: string,
    @Query('state') state: string,
  ) {
    return this.orderService.findAPage(query, +page, +state);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }
  @Get('/exportpdf/:id')
  exportPdf(@Param('id') id: string, @Res() res: Response) {
    const file = createReadStream(join(process.cwd(), 'package.json'));
    // console.log(await this.orderService.exportToPdf(+id));
    return new StreamableFile(file);
    // return await this.orderService.exportToPdf(+id)
  }
  @Post(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
