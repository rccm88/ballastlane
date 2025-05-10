import { Test, TestingModule } from '@nestjs/testing';
import { DrugIndicationsController } from './drug-indications.controller';
import { DrugIndicationsService } from './drug-indications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotFoundException } from '@nestjs/common';

describe('DrugIndicationsController', () => {
  let controller: DrugIndicationsController;
  let service: DrugIndicationsService;

  const mockDrugIndicationsService = {
    create: jest.fn(),
    createBulk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    removeOne: jest.fn(),
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
      .overrideGuard(RolesGuard)
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

  describe('create', () => {
    it('should create a new drug indication', async () => {
      const createDto = {
        drugName: 'Test Drug',
        title: 'Test Indication',
        text: 'Test Description',
        icd10_code: 'A01',
        icd10_description: 'Test ICD10',
      };

      const expectedResult = {
        id: '12345678-1234-1234-1234-123456789012',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDrugIndicationsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('createBulk', () => {
    it('should create multiple drug indications', async () => {
      const createBulkDto = {
        indications: [
          {
            drugName: 'Test Drug 1',
            title: 'Test Indication 1',
            text: 'Test Description 1',
            icd10_code: 'A01',
            icd10_description: 'Test ICD10 1',
          },
          {
            drugName: 'Test Drug 2',
            title: 'Test Indication 2',
            text: 'Test Description 2',
            icd10_code: 'A02',
            icd10_description: 'Test ICD10 2',
          },
        ],
      };

      const expectedResults = createBulkDto.indications.map((dto, index) => ({
        id: `12345678-1234-1234-1234-1234567890${index}`,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockDrugIndicationsService.createBulk.mockResolvedValue(expectedResults);

      const result = await controller.createBulk(createBulkDto);

      expect(result).toEqual(expectedResults);
      expect(service.createBulk).toHaveBeenCalledWith(createBulkDto);
    });
  });

  describe('findAll', () => {
    it('should return all drug indications', async () => {
      const expectedResults = [
        {
          id: '12345678-1234-1234-1234-123456789012',
          drugName: 'Test Drug',
          title: 'Test Indication',
          text: 'Test Description',
          icd10_code: 'A01',
          icd10_description: 'Test ICD10',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDrugIndicationsService.findAll.mockResolvedValue(expectedResults);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResults);
      expect(service.findAll).toHaveBeenCalledWith({
        order: {
          drugName: 'ASC',
          title: 'ASC',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single drug indication', async () => {
      const id = '12345678-1234-1234-1234-123456789012';
      const expectedResult = {
        id,
        drugName: 'Test Drug',
        title: 'Test Indication',
        text: 'Test Description',
        icd10_code: 'A01',
        icd10_description: 'Test ICD10',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDrugIndicationsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException when drug indication is not found', async () => {
      const id = 'non-existent-id';

      mockDrugIndicationsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('update', () => {
    it('should update a drug indication', async () => {
      const id = '12345678-1234-1234-1234-123456789012';
      const updateDto = {
        title: 'Updated Indication',
        text: 'Updated Description',
      };

      const expectedResult = {
        id,
        drugName: 'Test Drug',
        ...updateDto,
        icd10_code: 'A01',
        icd10_description: 'Test ICD10',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDrugIndicationsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a drug indication', async () => {
      const id = '12345678-1234-1234-1234-123456789012';

      mockDrugIndicationsService.removeOne.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.removeOne).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
