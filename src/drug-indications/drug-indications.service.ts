import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateDrugIndicationDto } from './dto/create-drug-indication.dto';
import { UpdateDrugIndicationDto } from './dto/update-drug-indication.dto';
import { DrugIndication } from './entities/drug-indication.entity';
import { CreateBulkDrugIndicationsDto } from './dto/create-bulk-drug-indications.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DrugIndicationsService {
  private readonly logger = new Logger(DrugIndicationsService.name);
  private readonly CACHE_PREFIX = 'drug_indication:';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    @InjectRepository(DrugIndication)
    private readonly drugIndicationRepository: Repository<DrugIndication>,
    private readonly redisService: RedisService,
  ) {}

  private getCacheKey(id: string): string {
    return `${this.CACHE_PREFIX}${id}`;
  }

  private getListCacheKey(): string {
    return `${this.CACHE_PREFIX}list`;
  }

  async create(
    createDrugIndicationDto: CreateDrugIndicationDto,
  ): Promise<DrugIndication> {
    const drugIndication = this.drugIndicationRepository.create(
      createDrugIndicationDto,
    );
    const saved = await this.drugIndicationRepository.save(drugIndication);
    await this.redisService.del(this.getListCacheKey());
    return saved;
  }

  async createBulk(
    createBulkDrugIndicationsDto: CreateBulkDrugIndicationsDto,
  ): Promise<DrugIndication[]> {
    const drugIndications = createBulkDrugIndicationsDto.indications.map(
      (dto) => this.drugIndicationRepository.create(dto),
    );
    const saved = await this.drugIndicationRepository.save(drugIndications);
    await this.redisService.del(this.getListCacheKey());
    return saved;
  }

  async findAll(
    options: FindManyOptions<DrugIndication>,
  ): Promise<DrugIndication[]> {
    const cacheKey = this.getListCacheKey();
    const cached = await this.redisService.get<DrugIndication[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const drugIndications = await this.drugIndicationRepository.find(options);
    await this.redisService.set(cacheKey, drugIndications, this.CACHE_TTL);
    return drugIndications;
  }

  async findOne(options: FindOneOptions<DrugIndication>) {
    const drugIndication = await this.drugIndicationRepository.findOne(options);
    if (drugIndication) {
      await this.redisService.set(
        this.getCacheKey(drugIndication.id),
        drugIndication,
        this.CACHE_TTL,
      );
    }
    return drugIndication;
  }

  async update(
    id: string,
    updateDrugIndicationDto: UpdateDrugIndicationDto,
  ): Promise<DrugIndication> {
    await this.drugIndicationRepository.update(id, updateDrugIndicationDto);
    const updated = await this.findOne({ where: { id } });
    if (updated) {
      await this.redisService.set(
        this.getCacheKey(id),
        updated,
        this.CACHE_TTL,
      );
      await this.redisService.del(this.getListCacheKey());
    }
    return updated;
  }

  async removeOne(options: FindOneOptions<DrugIndication>): Promise<void> {
    const drugIndication = await this.findOne(options);

    if (!drugIndication) {
      throw new NotFoundException('Drug indication not found');
    }

    await this.drugIndicationRepository.remove(drugIndication);
    await this.redisService.del(this.getCacheKey(drugIndication.id));
    await this.redisService.del(this.getListCacheKey());
  }

  // Function to remove bulk indications for a drug
  async removeBulk(options: FindManyOptions<DrugIndication>): Promise<void> {
    const drugIndications = await this.findAll(options);
    await this.drugIndicationRepository.remove(drugIndications);
    await this.redisService.del(this.getListCacheKey());
    for (const indication of drugIndications) {
      await this.redisService.del(this.getCacheKey(indication.id));
    }
  }
}
