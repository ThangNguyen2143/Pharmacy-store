import { Test, TestingModule } from '@nestjs/testing';
import { SuppilerController } from './suppiler.controller';
import { SuppilerService } from './suppiler.service';

describe('SuppilerController', () => {
  let controller: SuppilerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppilerController],
      providers: [SuppilerService],
    }).compile();

    controller = module.get<SuppilerController>(SuppilerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
