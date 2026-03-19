import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataloaderService } from './dataloader.service';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { BusinessService } from '../../businesses/entities/business-service.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Review } from '../../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Business,
      BusinessService,
      Employee,
      Review,
    ]),
  ],
  providers: [DataloaderService],
  exports: [DataloaderService],
})
export class DataloaderModule {}
