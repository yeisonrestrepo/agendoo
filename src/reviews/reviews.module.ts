import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsResolver } from './reviews.resolver';
import { BusinessesModule } from '../businesses/businesses.module';
import { DataloaderModule } from '../common/dataloaders/dataloader.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Booking]),
    BusinessesModule,
    DataloaderModule,
  ],
  providers: [ReviewsService, ReviewsResolver],
  exports: [ReviewsService, TypeOrmModule],
})
export class ReviewsModule {}
