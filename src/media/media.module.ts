import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { Business } from '../businesses/entities/business.entity';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, Business, Employee])],
  providers: [MediaService, MediaResolver],
  exports: [MediaService],
})
export class MediaModule {}
