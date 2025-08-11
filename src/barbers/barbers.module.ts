import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barber } from './entities/barber.entity';
import { Service } from './entities/service.entity';
import { BarbersService } from './barbers.service';
import { BarbersResolver } from './barbers.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Barber, Service]),
  ],
  providers: [BarbersService, BarbersResolver],
  exports: [BarbersService],
})
export class BarbersModule {}