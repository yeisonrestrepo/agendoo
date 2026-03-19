import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from './entities/amenity.entity';
import { BusinessAmenity } from './entities/business-amenity.entity';
import { CreateAmenityInput, UpdateAmenityInput } from './dto/amenity.dto';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
    @InjectRepository(BusinessAmenity)
    private businessAmenitiesRepository: Repository<BusinessAmenity>,
  ) {}

  async findAll(): Promise<Amenity[]> {
    return this.amenitiesRepository.find({ where: { active: true }, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Amenity> {
    const amenity = await this.amenitiesRepository.findOne({ where: { id } });
    if (!amenity) throw new NotFoundException('Amenity not found');
    return amenity;
  }

  async create(input: CreateAmenityInput): Promise<Amenity> {
    const existing = await this.amenitiesRepository.findOne({ where: { name: input.name } });
    if (existing) throw new ConflictException(`Amenity "${input.name}" already exists`);
    const amenity = this.amenitiesRepository.create(input);
    return this.amenitiesRepository.save(amenity);
  }

  async update(id: string, input: UpdateAmenityInput): Promise<Amenity> {
    const amenity = await this.findById(id);
    Object.assign(amenity, input);
    return this.amenitiesRepository.save(amenity);
  }

  async getBusinessAmenities(businessId: string): Promise<BusinessAmenity[]> {
    return this.businessAmenitiesRepository.find({ where: { businessId } });
  }

  async addToBusiness(businessId: string, amenityId: string): Promise<BusinessAmenity> {
    await this.findById(amenityId);

    const existing = await this.businessAmenitiesRepository.findOne({
      where: { businessId, amenityId },
    });
    if (existing) throw new ConflictException('Amenity already added to this business');

    const record = this.businessAmenitiesRepository.create({ businessId, amenityId });
    return this.businessAmenitiesRepository.save(record);
  }

  async removeFromBusiness(businessAmenityId: string, businessId: string): Promise<boolean> {
    const record = await this.businessAmenitiesRepository.findOne({
      where: { id: businessAmenityId, businessId },
    });
    if (!record) throw new NotFoundException('Amenity assignment not found');
    await this.businessAmenitiesRepository.remove(record);
    return true;
  }
}
