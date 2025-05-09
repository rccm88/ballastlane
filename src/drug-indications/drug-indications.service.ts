import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDrugIndicationDto } from './dto/create-drug-indication.dto';
import { UpdateDrugIndicationDto } from './dto/update-drug-indication.dto';
import { DrugIndication } from './entities/drug-indication.entity';

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

  async findAll(): Promise<DrugIndication[]> {
    return this.drugIndicationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<DrugIndication> {
    const drugIndication = await this.drugIndicationRepository.findOneBy({
      id,
    });

    if (!drugIndication) {
      throw new NotFoundException(`Drug indication with ID ${id} not found`);
    }
    return drugIndication;
  }

  async update(
    id: string,
    updateDrugIndicationDto: UpdateDrugIndicationDto,
  ): Promise<DrugIndication> {
    const drugIndication = await this.findOne(id);

    if (!drugIndication) {
      throw new NotFoundException(`Drug indication with ID ${id} not found`);
    }

    const updatedEntity = this.drugIndicationRepository.merge(
      drugIndication,
      updateDrugIndicationDto,
    );
    return this.drugIndicationRepository.save(updatedEntity);
  }

  remove(id: number) {
    return `This action removes a #${id} drugIndication`;
  }
}
