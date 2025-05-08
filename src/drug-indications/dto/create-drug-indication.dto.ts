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

class MetadataDto {
  @IsString()
  source: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @IsString()
  version: string;
}

export class CreateDrugIndicationDto {
  @IsString()
  drugName: string;

  @IsString()
  brandName: string;

  @IsString()
  indication: string;

  @IsArray()
  @IsString({ each: true })
  icd10Codes: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  synonyms?: string[];

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}
