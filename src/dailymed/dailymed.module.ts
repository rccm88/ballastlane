import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { DailyMedService } from './dailymed.service';
import { DailyMedController } from './dailymed.controller';
import { DrugIndicationsModule } from '../drug-indications/drug-indications.module';
import { OpenAiModule } from '../openai/openai.module';

@Module({
  imports: [HttpModule, ConfigModule, DrugIndicationsModule, OpenAiModule],
  controllers: [DailyMedController],
  providers: [DailyMedService],
  exports: [DailyMedService],
})
export class DailyMedModule {}
