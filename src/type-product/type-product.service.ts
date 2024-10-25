import { Injectable } from '@nestjs/common';
import { CreateTypeProductDto } from './dto/create-type-product.dto';
import { UpdateTypeProductDto } from './dto/update-type-product.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TypeProductService {
  constructor(private db: DatabaseService) {}
  async create(createTypeProductDto: CreateTypeProductDto) {
    return await this.db.typeproduct.create({
      data: {
        name: createTypeProductDto.name,
        description: createTypeProductDto.description,
      },
    });
  }

  async findAll() {
    return await this.db.typeproduct.findMany();
  }

  async findOne(id: number) {
    return await this.db.typeproduct.findUnique({ where: { id } });
  }

  async update(id: number, updateTypeProductDto: UpdateTypeProductDto) {
    return await this.db.typeproduct.update({
      where: { id },
      data: {
        name: updateTypeProductDto.name,
        description: updateTypeProductDto.description,
      },
    });
  }

  async remove(id: number) {
    return await this.db.typeproduct.delete({ where: { id } });
  }
}
