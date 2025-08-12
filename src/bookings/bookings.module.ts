import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsResolver } from './bookings.resolver';
import { ProfessionalsModule } from 'src/professionals/professionals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    ProfessionalsModule
  ],
  providers: [BookingsService, BookingsResolver],
  exports: [BookingsService],
})
export class BookingsModule {}