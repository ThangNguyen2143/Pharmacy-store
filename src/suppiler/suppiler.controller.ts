import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SuppilerService } from './suppiler.service';
import { CreateSuppilerDto } from './dto/create-suppiler.dto';
import { UpdateSuppilerDto } from './dto/update-suppiler.dto';

@Controller('suppiler')
export class SuppilerController {
  constructor(private readonly suppilerService: SuppilerService) {}

  @Post()
  create(@Body() createSuppilerDto: CreateSuppilerDto) {
    return this.suppilerService.create(createSuppilerDto);
  }

  @Get()
  findAll() {
    return this.suppilerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppilerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSuppilerDto: UpdateSuppilerDto,
  ) {
    return this.suppilerService.update(+id, updateSuppilerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.suppilerService.remove(+id);
  }
}
