import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MetadataDto {
  @ApiProperty({
    description: 'Source of the indication data',
    example: 'DailyMed',
  })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Confidence score of the indication extraction',
    example: 0.95,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({
    description: 'Version of the data source',
    example: '1.0',
  })
  @IsString()
  version: string;

  @ApiProperty({
    description: 'Section of the label where the indication was found',
    example: 'INDICATIONS AND USAGE',
  })
  @IsString()
  section: string;
}

export class CreateDrugIndicationDto {
  @ApiProperty({
    description: 'Generic name of the drug',
    example: 'Acetaminophen',
  })
  @IsString()
  drugName: string;

  @ApiProperty({
    description: 'Brand name of the drug',
    example: 'Tylenol',
  })
  @IsString()
  brandName: string;

  @ApiProperty({
    description: 'Medical condition or disease the drug is used to treat',
    example: 'Pain and fever',
  })
  @IsString()
  indication: string;

  @ApiProperty({
    description: 'Array of ICD-10 codes associated with the indication',
    example: ['M54.5', 'R50.9'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  icd10Codes: string[];

  @ApiPropertyOptional({
    description: 'Alternative names or terms for the indication',
    example: ['Fever', 'Pyrexia'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @ApiPropertyOptional({
    description: 'Detailed description of the drug indication',
    example: 'Used for the relief of mild to moderate pain and fever.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the drug indication is currently active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata about the drug indication',
    type: MetadataDto,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}
