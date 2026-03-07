import { Injectable } from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BatchService {
  constructor(private db: DatabaseService) {}
  async create(createBatchDto: CreateBatchDto) {
    const { quantity, ...batchData } = createBatchDto;
    const existingProduct = await this.db.product.findUnique({
      where: { id: batchData.productId },
    });
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    return this.db.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: batchData,
      });

      await tx.inventoryLot.create({
        data: {
          batch_Id: batch.id,
          qty_on_hand: quantity,
          qty_reserved: 0,
        },
      });

      await tx.historyInventory.create({
        data: {
          batch_Id: batch.id,
          type: 'IN',
          qty: quantity,
          ref_type: 'PURCHASE',
        },
      });

      return batch;
    });
  }

  findAll() {
    return this.db.batch.findMany();
  }

  findOne(id: number) {
    return this.db.batch.findUnique({ where: { id } });
  }

  update(id: number, updateBatchDto: UpdateBatchDto) {
    return this.db.batch.update({
      where: { id },
      data: updateBatchDto,
    });
  }

  remove(id: number) {
    return this.db.batch.delete({ where: { id } });
  }
}
