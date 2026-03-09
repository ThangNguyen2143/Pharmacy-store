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
import ResponseHelper from 'src/untils/helper/ResponseModel';

@Controller('/api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  async findAll(@Query('query') query: string, @Query('state') state: string) {
    const list = await this.orderService.findAll(query, +state);
    if (!list || list.length == 0) return ResponseHelper.ResponseNotFound();
    return ResponseHelper.ResponseSuccess(list);
  }
  @Get('/page')
  async findOnPage(
    @Query('query') query: string,
    @Query('page') page: string,
    @Query('state') state: string,
  ) {
    const list = await this.orderService.findAPage(query, +page, +state);
    if (!list || list.length == 0) return ResponseHelper.ResponseNotFound();
    return ResponseHelper.ResponseSuccess(list);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const anOrder = await this.orderService.findOne(+id);
    if (!anOrder) return ResponseHelper.ResponseNotFound();
    return ResponseHelper.ResponseSuccess(anOrder);
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
