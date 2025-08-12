import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professional } from './entities/professional.entity';
import { Service } from './entities/service.entity';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsResolver } from './professionals.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professional, Service]),
  ],
  providers: [ProfessionalsService, ProfessionalsResolver],
  exports: [ProfessionalsService, TypeOrmModule],
})
export class ProfessionalsModule {}