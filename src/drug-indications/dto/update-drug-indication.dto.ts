import { PartialType } from '@nestjs/swagger';
import { CreateDrugIndicationDto } from './create-drug-indication.dto';

export class UpdateDrugIndicationDto extends PartialType(
  CreateDrugIndicationDto,
) {}
