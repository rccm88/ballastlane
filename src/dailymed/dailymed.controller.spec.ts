import { Test, TestingModule } from '@nestjs/testing';
import { DailyMedController } from './dailymed.controller';
import { DailyMedService } from './dailymed.service';
import { DrugIndication } from '../drug-indications/entities/drug-indication.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// Mock the guards
jest.mock('../auth/guards/jwt-auth.guard');
jest.mock('../auth/guards/roles.guard');

describe('DailyMedController', () => {
  let controller: DailyMedController;
  let service: DailyMedService;

  const mockDailyMedService = {
    searchDrugLabel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyMedController],
      providers: [
        {
          provide: DailyMedService,
          useValue: mockDailyMedService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DailyMedController>(DailyMedController);
    service = module.get<DailyMedService>(DailyMedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchDrugLabels', () => {
    it('should return indications when drug is found', async () => {
      const mockIndications: DrugIndication[] = [
        {
          id: '12345678-1234-1234-1234-123456789012',
          drugName: 'Test Drug',
          title: 'Indication One',
          text: 'Used for treatment A.',
          icd10_code: 'A01',
          icd10_description: 'Test Description',
          createdAt: new Date(),
          updatedAt: new Date(),
          transformDrugName: jest.fn(),
        },
      ];

      mockDailyMedService.searchDrugLabel.mockResolvedValue(mockIndications);

      const result = await controller.searchDrugLabels('Test Drug');

      expect(result).toEqual({ indications: mockIndications });
      expect(service.searchDrugLabel).toHaveBeenCalledWith('Test Drug');
    });

    it('should return empty array when no drug is found', async () => {
      mockDailyMedService.searchDrugLabel.mockResolvedValue([]);

      const result = await controller.searchDrugLabels('Non-existent Drug');

      expect(result).toEqual({ indications: [] });
      expect(service.searchDrugLabel).toHaveBeenCalledWith('Non-existent Drug');
    });

    it('should handle service errors', async () => {
      const error = new Error('API Error');
      mockDailyMedService.searchDrugLabel.mockRejectedValue(error);

      await expect(controller.searchDrugLabels('Test Drug')).rejects.toThrow(
        'API Error',
      );
      expect(service.searchDrugLabel).toHaveBeenCalledWith('Test Drug');
    });

    it('should handle empty drug name', async () => {
      mockDailyMedService.searchDrugLabel.mockResolvedValue([]);

      const result = await controller.searchDrugLabels('');

      expect(result).toEqual({ indications: [] });
      expect(service.searchDrugLabel).toHaveBeenCalledWith('');
    });
  });
});
