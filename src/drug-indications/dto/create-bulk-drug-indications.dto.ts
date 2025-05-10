import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDrugIndicationDto } from './create-drug-indication.dto';

export class CreateBulkDrugIndicationsDto {
  @ApiProperty({
    description: 'Array of drug indications to create',
    type: [CreateDrugIndicationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDrugIndicationDto)
  indications: CreateDrugIndicationDto[];
}
