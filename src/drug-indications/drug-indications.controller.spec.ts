import { Test, TestingModule } from '@nestjs/testing';
import { DrugIndicationsController } from './drug-indications.controller';
import { DrugIndicationsService } from './drug-indications.service';

describe('DrugIndicationsController', () => {
  let controller: DrugIndicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrugIndicationsController],
      providers: [DrugIndicationsService],
    }).compile();

    controller = module.get<DrugIndicationsController>(DrugIndicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
