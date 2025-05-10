import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDrugIndicationDto {
  @ApiProperty({
    description: 'Generic name of the drug',
    example: 'Dupilumab',
  })
  @IsString()
  drugName: string;

  @ApiProperty({
    description: 'Title of the indication',
    example: 'Atopic Dermatitis',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Full text of the indication',
    example:
      'for the treatment of adult and pediatric patients aged 6 months and older with moderate-to-severe AD whose disease is not adequately controlled with topical prescription therapies or when those therapies are not advisable.',
  })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    description: 'ICD-10 code for the indication',
    example: 'L20.81',
  })
  @IsString()
  @IsOptional()
  icd10_code?: string;

  @ApiPropertyOptional({
    description: 'Description of the ICD-10 code',
    example: 'Atopic dermatitis',
  })
  @IsString()
  @IsOptional()
  icd10_description?: string;
}
