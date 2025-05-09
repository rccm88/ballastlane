import { Test, TestingModule } from '@nestjs/testing';
import { DrugIndicationsService } from './drug-indications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DrugIndication } from './entities/drug-indication.entity';
import { Repository } from 'typeorm';

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
});
