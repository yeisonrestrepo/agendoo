import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientNote } from './entities/client-note.entity';
import { CancellationPolicy } from './entities/cancellation-policy.entity';
import { BusinessClient } from './entities/business-client.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingHistory } from '../bookings/entities/booking-history.entity';
import { CrmService } from './crm.service';
import { CrmResolver, ClientNoteResolver, ClientVisitSummaryResolver } from './crm.resolver';
import { BusinessesModule } from '../businesses/businesses.module';
import { DataloaderModule } from '../common/dataloaders/dataloader.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientNote, CancellationPolicy, BusinessClient, Booking, BookingHistory]),
    BusinessesModule,
    DataloaderModule,
  ],
  providers: [CrmService, CrmResolver, ClientNoteResolver, ClientVisitSummaryResolver],
  exports: [CrmService],
})
export class CrmModule {}
