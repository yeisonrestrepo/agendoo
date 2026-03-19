import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingHistory } from './entities/booking-history.entity';
import { BusinessService } from '../businesses/entities/business-service.entity';
import { BookingsService } from './bookings.service';
import { BookingsResolver } from './bookings.resolver';
import { BusinessesModule } from '../businesses/businesses.module';
import { DataloaderModule } from '../common/dataloaders/dataloader.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingHistory, BusinessService]),
    BusinessesModule,
    DataloaderModule,
  ],
  providers: [BookingsService, BookingsResolver],
  exports: [BookingsService, TypeOrmModule],
})
export class BookingsModule {}
