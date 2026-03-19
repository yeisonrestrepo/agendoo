import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessService } from './entities/business-service.entity';
import { BusinessesService } from './businesses.service';
import { BusinessesResolver } from './businesses.resolver';
import { DataloaderModule } from '../common/dataloaders/dataloader.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessService]),
    DataloaderModule,
  ],
  providers: [BusinessesService, BusinessesResolver],
  exports: [BusinessesService, TypeOrmModule],
})
export class BusinessesModule {}
