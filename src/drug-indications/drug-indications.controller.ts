import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { DrugIndicationsService } from './drug-indications.service';
import { CreateDrugIndicationDto } from './dto/create-drug-indication.dto';
import { UpdateDrugIndicationDto } from './dto/update-drug-indication.dto';

@Controller('drug-indications')
export class DrugIndicationsController {
  constructor(
    private readonly drugIndicationsService: DrugIndicationsService,
  ) {}

  @Post()
  create(@Body() createDrugIndicationDto: CreateDrugIndicationDto) {
    return this.drugIndicationsService.create(createDrugIndicationDto);
  }

  @Get()
  findAll() {
    return this.drugIndicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.drugIndicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDrugIndicationDto: UpdateDrugIndicationDto,
  ) {
    return this.drugIndicationsService.update(id, updateDrugIndicationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.drugIndicationsService.remove(id);
  }
}
