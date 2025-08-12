import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional, ProfessionalType } from './entities/professional.entity';
import { Service, ServiceCategory } from './entities/service.entity';
import { CreateServiceInput, ProfessionalFiltersInput } from './dto/professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private professionalsRepository: Repository<Professional>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async findAll(): Promise<Professional[]> {
    return this.professionalsRepository.find({
      relations: ['user', 'user.profile', 'services'],
    });
  }

  async findByType(type: ProfessionalType): Promise<Professional[]> {
    return this.professionalsRepository.find({
      where: { type },
      relations: ['user', 'user.profile', 'services'],
    });
  }

  async findById(id: string): Promise<Professional> {
    const professional = await this.professionalsRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'services'],
    });

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    return professional;
  }

  async findByUserId(userId: string): Promise<Professional | null> {
    return this.professionalsRepository.findOne({
      where: { userId },
      relations: ['user', 'user.profile', 'services'],
    });
  }

  async findProfessionalsWithFilters(filters: ProfessionalFiltersInput): Promise<Professional[]> {
    let query = this.professionalsRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('professional.services', 'services')
      .leftJoinAndSelect('professional.professionalAmenities', 'professionalAmenities')
      .leftJoinAndSelect('professionalAmenities.amenity', 'amenity');

    if (filters.types && filters.types.length > 0) {
      query = query.andWhere('professional.type IN (:...types)', { types: filters.types });
    }

    if (filters.lat && filters.lng && filters.radius) {
      const radiusInMeters = filters.radius * 1000;
      query = query.andWhere(
        `ST_DWithin(
          ST_Point(profile.lng, profile.lat)::geography,
          ST_Point(:lng, :lat)::geography,
          :radius
        )`,
        { lat: filters.lat, lng: filters.lng, radius: radiusInMeters }
      );
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined) {
        query = query.andWhere('services.price >= :minPrice', { minPrice: filters.minPrice });
      }
      if (filters.maxPrice !== undefined) {
        query = query.andWhere('services.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }
    }

    if (filters.serviceCategories && filters.serviceCategories.length > 0) {
      query = query.andWhere('services.category IN (:...serviceCategories)', { 
        serviceCategories: filters.serviceCategories 
      });
    }

    if (filters.amenityIds && filters.amenityIds.length > 0) {
      query = query.andWhere('amenity.id IN (:...amenityIds)', { 
        amenityIds: filters.amenityIds 
      });
    }

    if (filters.minRating !== undefined) {
      query = query.andWhere('professional.averageRating >= :minRating', { 
        minRating: filters.minRating 
      });
    }

    if (filters.verifiedOnly) {
      query = query.andWhere('professional.verified = true');
    }

    if (filters.instantBookingOnly) {
      query = query.andWhere('professional.instantBooking = true');
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    if (filters.lat && filters.lng) {
      query = query.orderBy(
        `ST_Distance(
          ST_Point(profile.lng, profile.lat)::geography,
          ST_Point(:lng, :lat)::geography
        )`,
        'ASC'
      );
    } else {
      query = query.orderBy('professional.averageRating', 'DESC');
    }

    return query.getMany();
  }

  async createService(professionalId: string, input: CreateServiceInput): Promise<Service> {
    const professional = await this.findById(professionalId);
    
    const service = this.servicesRepository.create({
      professionalId: professional.id,
      ...input,
    });

    return this.servicesRepository.save(service);
  }

  async getServices(professionalId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { professionalId, active: true },
    });
  }

  async getServicesByCategory(professionalId: string, category: ServiceCategory): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { professionalId, category, active: true },
    });
  }

  async updateAverageRating(professionalId: string): Promise<void> {
    const result = await this.professionalsRepository
      .createQueryBuilder()
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .from('reviews', 'review')
      .where('review.professionalId = :professionalId', { professionalId })
      .getRawOne();

    await this.professionalsRepository.update(professionalId, {
      averageRating: parseFloat(result.average) || 0,
      totalReviews: parseInt(result.count) || 0,
    });
  }
}