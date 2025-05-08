import { Injectable } from '@nestjs/common';
import { CreateDrugIndicationDto } from './dto/create-drug-indication.dto';
import { UpdateDrugIndicationDto } from './dto/update-drug-indication.dto';

@Injectable()
export class DrugIndicationsService {
  create(createDrugIndicationDto: CreateDrugIndicationDto) {
    return 'This action adds a new drugIndication';
  }

  findAll() {
    return `This action returns all drugIndications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drugIndication`;
  }

  update(id: number, updateDrugIndicationDto: UpdateDrugIndicationDto) {
    return `This action updates a #${id} drugIndication`;
  }

  remove(id: number) {
    return `This action removes a #${id} drugIndication`;
  }
}
