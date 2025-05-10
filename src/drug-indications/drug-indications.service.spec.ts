import { Test, TestingModule } from '@nestjs/testing';
import { DrugIndicationsService } from './drug-indications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DrugIndication } from './entities/drug-indication.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('DrugIndicationsService', () => {
  let service: DrugIndicationsService;
  let repository: Repository<DrugIndication>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrugIndicationsService,
        {
          provide: getRepositoryToken(DrugIndication),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DrugIndicationsService>(DrugIndicationsService);
    repository = module.get<Repository<DrugIndication>>(
      getRepositoryToken(DrugIndication),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockRepository.create.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
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

      // Reset mock before test
      mockRepository.create.mockReset();
      mockRepository.save.mockReset();

      // Set up mock implementation
      mockRepository.create.mockImplementation((dto) => {
        const index = createBulkDto.indications.findIndex(
          (indication) => indication.drugName === dto.drugName,
        );
        return {
          id: `12345678-1234-1234-1234-1234567890${index}`,
          ...dto,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      mockRepository.save.mockResolvedValue(expectedResults);

      const result = await service.createBulk(createBulkDto);

      expect(result).toEqual(expectedResults);
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResults);
    });
  });

  describe('findAll', () => {
    it('should return all drug indications matching the options', async () => {
      const options = { where: { drugName: 'Test Drug' } };
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

      mockRepository.find.mockResolvedValue(expectedResults);

      const result = await service.findAll(options);

      expect(result).toEqual(expectedResults);
      expect(mockRepository.find).toHaveBeenCalledWith(options);
    });
  });

  describe('findOne', () => {
    it('should return a single drug indication', async () => {
      const options = { where: { id: '12345678-1234-1234-1234-123456789012' } };
      const expectedResult = {
        id: '12345678-1234-1234-1234-123456789012',
        drugName: 'Test Drug',
        title: 'Test Indication',
        text: 'Test Description',
        icd10_code: 'A01',
        icd10_description: 'Test ICD10',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(expectedResult);

      const result = await service.findOne(options);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.findOne).toHaveBeenCalledWith(options);
    });
  });

  describe('update', () => {
    it('should update an existing drug indication', async () => {
      const id = '12345678-1234-1234-1234-123456789012';
      const updateDto = {
        title: 'Updated Indication',
        text: 'Updated Description',
      };

      const existingDrug = {
        id,
        drugName: 'Test Drug',
        title: 'Test Indication',
        text: 'Test Description',
        icd10_code: 'A01',
        icd10_description: 'Test ICD10',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResult = {
        ...existingDrug,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingDrug);
      mockRepository.merge.mockReturnValue(expectedResult);
      mockRepository.save.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.merge).toHaveBeenCalledWith(
        existingDrug,
        updateDto,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw NotFoundException when drug indication is not found', async () => {
      const id = 'non-existent-id';
      const updateDto = {
        title: 'Updated Indication',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('removeOne', () => {
    it('should remove a single drug indication', async () => {
      const options = { where: { id: '12345678-1234-1234-1234-123456789012' } };
      const existingDrug = {
        id: '12345678-1234-1234-1234-123456789012',
        drugName: 'Test Drug',
        title: 'Test Indication',
        text: 'Test Description',
        icd10_code: 'A01',
        icd10_description: 'Test ICD10',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingDrug);
      mockRepository.remove.mockResolvedValue(existingDrug);

      await service.removeOne(options);

      expect(mockRepository.findOne).toHaveBeenCalledWith(options);
      expect(mockRepository.remove).toHaveBeenCalledWith(existingDrug);
    });

    it('should throw NotFoundException when drug indication is not found', async () => {
      const options = { where: { id: 'non-existent-id' } };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.removeOne(options)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith(options);
    });
  });

  describe('removeBulk', () => {
    it('should remove multiple drug indications', async () => {
      const options = { where: { drugName: 'Test Drug' } };
      const existingDrugs = [
        {
          id: '12345678-1234-1234-1234-123456789012',
          drugName: 'Test Drug',
          title: 'Test Indication 1',
          text: 'Test Description 1',
          icd10_code: 'A01',
          icd10_description: 'Test ICD10 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '12345678-1234-1234-1234-123456789013',
          drugName: 'Test Drug',
          title: 'Test Indication 2',
          text: 'Test Description 2',
          icd10_code: 'A02',
          icd10_description: 'Test ICD10 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(existingDrugs);
      mockRepository.remove.mockResolvedValue(existingDrugs);

      await service.removeBulk(options);

      expect(mockRepository.find).toHaveBeenCalledWith(options);
      expect(mockRepository.remove).toHaveBeenCalledWith(existingDrugs);
    });

    it('should handle empty results when removing bulk', async () => {
      const options = { where: { drugName: 'Non-existent Drug' } };

      mockRepository.find.mockResolvedValue([]);
      mockRepository.remove.mockResolvedValue([]);

      await service.removeBulk(options);

      expect(mockRepository.find).toHaveBeenCalledWith(options);
      expect(mockRepository.remove).toHaveBeenCalledWith([]);
    });
  });
});
