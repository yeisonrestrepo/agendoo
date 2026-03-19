import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Amenity } from './entities/amenity.entity';
import { BusinessAmenity } from './entities/business-amenity.entity';
import { AmenitiesService } from './amenities.service';
import { AmenitiesResolver } from './amenities.resolver';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Amenity, BusinessAmenity]),
    BusinessesModule,
  ],
  providers: [AmenitiesService, AmenitiesResolver],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
