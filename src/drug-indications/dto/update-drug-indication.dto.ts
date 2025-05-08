import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugIndicationDto } from './create-drug-indication.dto';

export class UpdateDrugIndicationDto extends PartialType(
  CreateDrugIndicationDto,
) {}
