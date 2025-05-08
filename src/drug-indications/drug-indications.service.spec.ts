import { Test, TestingModule } from '@nestjs/testing';
import { DrugIndicationsService } from './drug-indications.service';

describe('DrugIndicationsService', () => {
  let service: DrugIndicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrugIndicationsService],
    }).compile();

    service = module.get<DrugIndicationsService>(DrugIndicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
