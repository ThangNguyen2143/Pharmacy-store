import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('/api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Request() req: any) {
    return this.cartService.createNewCart(req.user);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.getCartById(+id);
  }
  @UseGuards(JwtGuard)
  @Post(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}
