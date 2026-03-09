import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import ResponseHelper from 'src/untils/helper/ResponseModel';
@UseGuards(JwtGuard)
@ApiBearerAuth('access-token')
@Controller('/api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Request() req: any) {
    return this.cartService.createNewCart(req.user);
  }

  @Get()
  async findAll() {
    const list = await this.cartService.findAll();
    if (!list || list.length == 0) return ResponseHelper.ResponseNotFound();
    return ResponseHelper.ResponseSuccess(list);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const list = await this.cartService.getCartById(+id);
    if (typeof list) return ResponseHelper.ResponseNotFound();
    return ResponseHelper.ResponseSuccess(list);
  }
  @Post(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
