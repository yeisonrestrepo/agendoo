import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessHours } from './entities/business-hours.entity';
import { EmployeeSchedule } from './entities/employee-schedule.entity';
import { ScheduleException } from './entities/schedule-exception.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityResolver } from './availability.resolver';
import { BusinessesModule } from '../businesses/businesses.module';
import { BookingsModule } from '../bookings/bookings.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessHours, EmployeeSchedule, ScheduleException]),
    BusinessesModule,
    BookingsModule,
    EmployeesModule,
  ],
  providers: [AvailabilityService, AvailabilityResolver],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
