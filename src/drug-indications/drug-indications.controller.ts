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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/constants/roles.enum';

@ApiTags('drug-indications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drug-indications')
export class DrugIndicationsController {
  constructor(
    private readonly drugIndicationsService: DrugIndicationsService,
  ) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create a new drug indication (user role)' })
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
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create multiple drug indications (user role)' })
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
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get all drug indications (user role)' })
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
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get drug indication by ID (user role)' })
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
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Update drug indication by ID (user role)' })
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
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Delete drug indication by ID (user role)' })
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
