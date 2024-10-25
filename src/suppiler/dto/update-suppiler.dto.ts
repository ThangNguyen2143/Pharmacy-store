import { PartialType } from '@nestjs/mapped-types';
import { CreateSuppilerDto } from './create-suppiler.dto';

export class UpdateSuppilerDto extends PartialType(CreateSuppilerDto) {}
