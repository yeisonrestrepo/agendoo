import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsResolver } from './reviews.resolver';
import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Booking]),
    ProfessionalsModule,
  ],
  providers: [ReviewsService, ReviewsResolver],
  exports: [ReviewsService, TypeOrmModule],
})
export class ReviewsModule {}