import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeService } from './entities/employee-service.entity';
import { EmployeesService } from './employees.service';
import { EmployeesResolver } from './employees.resolver';
import { BusinessesModule } from '../businesses/businesses.module';
import { DataloaderModule } from '../common/dataloaders/dataloader.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, EmployeeService]),
    BusinessesModule,
    DataloaderModule,
  ],
  providers: [EmployeesService, EmployeesResolver],
  exports: [EmployeesService, TypeOrmModule],
})
export class EmployeesModule {}
