import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DailyMedService } from './dailymed.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DrugIndication } from '../drug-indications/entities/drug-indication.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/constants/roles.enum';

@ApiTags('dailymed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dailymed')
export class DailyMedController {
  constructor(private readonly dailyMedService: DailyMedService) {}

  @Get('search')
  @Roles(UserRole.USER)
  @ApiOperation({
    summary:
      'Search for a drug label, return its indications and save them to the database (user role)',
  })
  @ApiQuery({ name: 'name', description: 'Drug name to search for' })
  @ApiResponse({
    status: 200,
    description: 'Returns the indications for the matching drug',
    schema: {
      type: 'object',
      properties: {
        indications: {
          type: 'array',
          description: 'Indications for the drug',
          example: [
            {
              id: '12345678-1234-1234-1234-123456789012',
              drugName: 'Drug Name',
              title: 'Indication Title',
              text: 'Indication Text',
              icd10_code: 'ICD-10 Code',
              icd10_description: 'ICD-10 Description',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchDrugLabels(
    @Query('name') name: string,
  ): Promise<{ indications: DrugIndication[] }> {
    const indications = await this.dailyMedService.searchDrugLabel(name);
    return { indications };
  }
}
