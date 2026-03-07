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
import ResponseHelper from 'src/untils/helper/ResponseModel';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserProfile(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (user) {
      return ResponseHelper.ResponseSuccess(user);
    }
    return ResponseHelper.ResponseNotFound();
  }
}
