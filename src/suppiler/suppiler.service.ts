import { Injectable } from '@nestjs/common';
import { CreateSuppilerDto } from './dto/create-suppiler.dto';
import { UpdateSuppilerDto } from './dto/update-suppiler.dto';

@Injectable()
export class SuppilerService {
  create(createSuppilerDto: CreateSuppilerDto) {
    return 'This action adds a new suppiler';
  }

  findAll() {
    return `This action returns all suppiler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suppiler`;
  }

  update(id: number, updateSuppilerDto: UpdateSuppilerDto) {
    return `This action updates a #${id} suppiler`;
  }

  remove(id: number) {
    return `This action removes a #${id} suppiler`;
  }
}
