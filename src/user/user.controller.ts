import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserProfile(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findById(id);
  }
}
