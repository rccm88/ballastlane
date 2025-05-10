import { ApiProperty } from '@nestjs/swagger';

export class DrugNameDto {
  @ApiProperty({
    description: 'Type of drug name (G for generic, B for brand)',
    example: 'G',
  })
  name_type: string;

  @ApiProperty({
    description: 'Name of the drug',
    example: 'dupilumab',
  })
  drug_name: string;

  @ApiProperty({
    description: 'DailyMed Set ID for the drug label',
    example: '12345678-1234-1234-1234-123456789012',
  })
  setid: string;
}

export class PaginationMetadataDto {
  @ApiProperty({
    description: 'Total number of elements',
    example: 273,
  })
  total_elements: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  current_page: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  total_pages: number;

  @ApiProperty({
    description: 'Number of elements per page',
    example: 100,
  })
  elements_per_page: number;

  @ApiProperty({
    description: 'URL for the next page',
    example:
      'https://dailymed.nlm.nih.gov/dailymed/services/v2/drugnames?drug_name=alpha&page=2&pagesize=100',
    required: false,
  })
  next_page_url?: string;

  @ApiProperty({
    description: 'URL for the previous page',
    example:
      'https://dailymed.nlm.nih.gov/dailymed/services/v2/drugnames?drug_name=alpha&page=1&pagesize=100',
    required: false,
  })
  previous_page_url?: string;
}

export class DrugSearchResponseDto {
  @ApiProperty({
    description: 'Array of matching drug names',
    type: [DrugNameDto],
  })
  data: DrugNameDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetadataDto,
  })
  metadata: PaginationMetadataDto;
}
