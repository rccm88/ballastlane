import { Test, TestingModule } from '@nestjs/testing';
import { DrugIndicationsController } from './drug-indications.controller';
import { DrugIndicationsService } from './drug-indications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('DrugIndicationsController', () => {
  let controller: DrugIndicationsController;
  let service: DrugIndicationsService;

  const mockDrugIndicationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrugIndicationsController],
      providers: [
        {
          provide: DrugIndicationsService,
          useValue: mockDrugIndicationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DrugIndicationsController>(
      DrugIndicationsController,
    );
    service = module.get<DrugIndicationsService>(DrugIndicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
