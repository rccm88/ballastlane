import { Controller, Get, Query } from '@nestjs/common';
import { DailyMedService } from './dailymed.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('dailymed')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dailymed')
export class DailyMedController {
  constructor(private readonly dailyMedService: DailyMedService) {}

  @Get('search')
  // @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Search for a drug and return its SET ID' })
  @ApiQuery({ name: 'name', description: 'Drug name to search for' })
  @ApiResponse({
    status: 200,
    description: 'Returns the SET ID for the first matching drug',
    schema: {
      type: 'object',
      properties: {
        setId: {
          type: 'string',
          description: 'DailyMed SET ID for the drug',
          example: '12345678-1234-1234-1234-123456789012',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchDrugLabels(
    @Query('name') name: string,
  ): Promise<{ setId: string | null }> {
    const setId = await this.dailyMedService.searchDrugSetId(name);
    return { setId };
  }
}
