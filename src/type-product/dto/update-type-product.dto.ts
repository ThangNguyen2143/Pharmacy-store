import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeProductDto } from './create-type-product.dto';

export class UpdateTypeProductDto extends PartialType(CreateTypeProductDto) {}
