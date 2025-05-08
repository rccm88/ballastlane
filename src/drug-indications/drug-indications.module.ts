import { Module } from '@nestjs/common';
import { DrugIndicationsService } from './drug-indications.service';
import { DrugIndicationsController } from './drug-indications.controller';

@Module({
  controllers: [DrugIndicationsController],
  providers: [DrugIndicationsService],
})
export class DrugIndicationsModule {}
