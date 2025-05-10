import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { DrugIndicationsService } from './drug-indications.service';
import { CreateDrugIndicationDto } from './dto/create-drug-indication.dto';
import { UpdateDrugIndicationDto } from './dto/update-drug-indication.dto';
import { CreateBulkDrugIndicationsDto } from './dto/create-bulk-drug-indications.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DrugIndication } from './entities/drug-indication.entity';

@ApiTags('drug-indications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('drug-indications')
export class DrugIndicationsController {
  constructor(
    private readonly drugIndicationsService: DrugIndicationsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new drug indication' })
  @ApiResponse({
    status: 201,
    description: 'The drug indication has been successfully created.',
    type: DrugIndication,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createDrugIndicationDto: CreateDrugIndicationDto) {
    return this.drugIndicationsService.create(createDrugIndicationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple drug indications' })
  @ApiResponse({
    status: 201,
    description: 'The drug indications have been successfully created.',
    type: [DrugIndication],
  })
  createBulk(
    @Body() createBulkDrugIndicationsDto: CreateBulkDrugIndicationsDto,
  ) {
    return this.drugIndicationsService.createBulk(createBulkDrugIndicationsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drug indications' })
  @ApiResponse({ status: 200, description: 'Return all drug indications' })
  findAll() {
    return this.drugIndicationsService.findAll({
      order: {
        drugName: 'ASC',
        title: 'ASC',
      },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drug indication by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the drug indication' })
  @ApiResponse({ status: 200, description: 'Return drug indication by ID' })
  @ApiResponse({ status: 404, description: 'Drug indication not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const drugIndication = await this.drugIndicationsService.findOne({
      where: { id },
    });
    if (!drugIndication) {
      throw new NotFoundException('Drug indication not found');
    }
    return drugIndication;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update drug indication by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the drug indication' })
  @ApiResponse({
    status: 200,
    description: 'Drug indication successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Drug indication not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugIndicationDto: UpdateDrugIndicationDto,
  ) {
    return this.drugIndicationsService.update(id, updateDrugIndicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete drug indication by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the drug indication' })
  @ApiResponse({
    status: 200,
    description: 'Drug indication successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Drug indication not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.drugIndicationsService.removeOne({ where: { id } });
  }
}
