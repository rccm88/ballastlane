import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateDrugIndicationDto } from './dto/create-drug-indication.dto';
import { UpdateDrugIndicationDto } from './dto/update-drug-indication.dto';
import { DrugIndication } from './entities/drug-indication.entity';
import { CreateBulkDrugIndicationsDto } from './dto/create-bulk-drug-indications.dto';

@Injectable()
export class DrugIndicationsService {
  constructor(
    @InjectRepository(DrugIndication)
    private drugIndicationRepository: Repository<DrugIndication>,
  ) {}

  async create(
    createDrugIndicationDto: CreateDrugIndicationDto,
  ): Promise<DrugIndication> {
    const drugIndication = this.drugIndicationRepository.create(
      createDrugIndicationDto,
    );
    return this.drugIndicationRepository.save(drugIndication);
  }

  async createBulk(
    createBulkDrugIndicationsDto: CreateBulkDrugIndicationsDto,
  ): Promise<DrugIndication[]> {
    const drugIndications = createBulkDrugIndicationsDto.indications.map(
      (dto) => this.drugIndicationRepository.create(dto),
    );
    return this.drugIndicationRepository.save(drugIndications);
  }

  async findAll(): Promise<DrugIndication[]> {
    return this.drugIndicationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(options: FindOneOptions<DrugIndication>) {
    return this.drugIndicationRepository.findOne(options);
  }

  async update(
    id: string,
    updateDrugIndicationDto: UpdateDrugIndicationDto,
  ): Promise<DrugIndication> {
    const drugIndication = await this.findOne({ where: { id } });

    if (!drugIndication) {
      throw new NotFoundException('Drug indication not found');
    }

    const updatedEntity = this.drugIndicationRepository.merge(
      drugIndication,
      updateDrugIndicationDto,
    );
    return this.drugIndicationRepository.save(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    const drugIndication = await this.findOne({ where: { id } });

    if (!drugIndication) {
      throw new NotFoundException('Drug indication not found');
    }

    await this.drugIndicationRepository.remove(drugIndication);
  }
}
