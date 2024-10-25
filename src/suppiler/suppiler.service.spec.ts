import { Test, TestingModule } from '@nestjs/testing';
import { SuppilerService } from './suppiler.service';

describe('SuppilerService', () => {
  let service: SuppilerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuppilerService],
    }).compile();

    service = module.get<SuppilerService>(SuppilerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
