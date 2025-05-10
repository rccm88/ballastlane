import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrugIndicationsService } from './drug-indications.service';
import { DrugIndicationsController } from './drug-indications.controller';
import { DrugIndication } from './entities/drug-indication.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([DrugIndication]), RedisModule],
  controllers: [DrugIndicationsController],
  providers: [DrugIndicationsService],
  exports: [DrugIndicationsService],
})
export class DrugIndicationsModule {}
