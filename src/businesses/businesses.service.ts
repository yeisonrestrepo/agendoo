import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessType } from './entities/business.entity';
import { BusinessService } from './entities/business-service.entity';
import { CreateBusinessInput, UpdateBusinessInput, CreateBusinessServiceInput, BusinessFiltersInput } from './dto/business.dto';
import { ServiceCategory } from '../service-catalog/entities/service-catalog.entity';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private businessesRepository: Repository<Business>,
    @InjectRepository(BusinessService)
    private businessServicesRepository: Repository<BusinessService>,
  ) {}

  async create(ownerId: string, input: CreateBusinessInput): Promise<Business> {
    const existing = await this.businessesRepository.findOne({ where: { ownerId } });
    if (existing) {
      throw new ConflictException('A business is already registered for this account');
    }

    const business = this.businessesRepository.create({ ownerId, ...input });
    return this.businessesRepository.save(business);
  }

  async update(ownerId: string, input: UpdateBusinessInput): Promise<Business> {
    const business = await this.businessesRepository.findOne({ where: { ownerId } });
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    Object.assign(business, input);
    return this.businessesRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return this.businessesRepository.find({ where: { active: true } });
  }

  async findByType(type: BusinessType): Promise<Business[]> {
    return this.businessesRepository.find({ where: { type, active: true } });
  }

  async findById(id: string): Promise<Business> {
    const business = await this.businessesRepository.findOne({
      where: { id },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async findByOwnerId(ownerId: string): Promise<Business | null> {
    return this.businessesRepository.findOne({
      where: { ownerId },
    });
  }

  async findWithFilters(filters: BusinessFiltersInput): Promise<Business[]> {
    let query = this.businessesRepository
      .createQueryBuilder('business')
      .leftJoin('business.businessServices', 'businessServices')
      .leftJoin('businessServices.catalogService', 'catalogService')
      .leftJoin('business.businessAmenities', 'businessAmenities')
      .leftJoin('businessAmenities.amenity', 'amenity')
      .andWhere('business.active = true');

    if (filters.types && filters.types.length > 0) {
      query = query.andWhere('business.type IN (:...types)', { types: filters.types });
    }

    if (filters.city) {
      query = query.andWhere('LOWER(business.city) = LOWER(:city)', { city: filters.city });
    }

    if (filters.serviceModality) {
      query = query.andWhere('business.serviceModality = :serviceModality', {
        serviceModality: filters.serviceModality,
      });
    }

    if (filters.lat && filters.lng && filters.radius) {
      const radiusInMeters = filters.radius * 1000;
      query = query.andWhere(
        `(
          (business.serviceModality IN ('PHYSICAL', 'BOTH') AND business.lat IS NOT NULL AND business.lng IS NOT NULL
            AND ST_DWithin(
              ST_Point(business.lng, business.lat)::geography,
              ST_Point(:lng, :lat)::geography,
              :radius
            )
          )
          OR
          (business.serviceModality IN ('HOME_SERVICE', 'BOTH') AND business.serviceAreaLat IS NOT NULL AND business.serviceAreaLng IS NOT NULL
            AND ST_DWithin(
              ST_Point(business.serviceAreaLng, business.serviceAreaLat)::geography,
              ST_Point(:lng, :lat)::geography,
              business.serviceRadius * 1000
            )
          )
        )`,
        { lat: filters.lat, lng: filters.lng, radius: radiusInMeters }
      );
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined) {
        query = query.andWhere('businessServices.price >= :minPrice', { minPrice: filters.minPrice });
      }
      if (filters.maxPrice !== undefined) {
        query = query.andWhere('businessServices.price <= :maxPrice', { maxPrice: filters.maxPrice });
      }
    }

    if (filters.serviceCategories && filters.serviceCategories.length > 0) {
      query = query.andWhere('catalogService.category IN (:...serviceCategories)', {
        serviceCategories: filters.serviceCategories
      });
    }

    if (filters.amenityIds && filters.amenityIds.length > 0) {
      query = query.andWhere('amenity.id IN (:...amenityIds)', {
        amenityIds: filters.amenityIds
      });
    }

    if (filters.minRating !== undefined) {
      query = query.andWhere('business.averageRating >= :minRating', {
        minRating: filters.minRating
      });
    }

    if (filters.verifiedOnly) {
      query = query.andWhere('business.verified = true');
    }

    if (filters.instantBookingOnly) {
      query = query.andWhere('business.instantBooking = true');
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    if (filters.lat && filters.lng) {
      query = query
        .addSelect(
          `CASE
            WHEN business.lat IS NOT NULL AND business.lng IS NOT NULL
            THEN ST_Distance(
              ST_Point(business.lng, business.lat)::geography,
              ST_Point(:orderLng, :orderLat)::geography
            )
            ELSE NULL
          END`,
          'distance'
        )
        .setParameter('orderLat', filters.lat)
        .setParameter('orderLng', filters.lng)
        .orderBy('distance', 'ASC', 'NULLS LAST');
    } else {
      query = query.orderBy('business.averageRating', 'DESC');
    }

    return query.getMany();
  }

  async createBusinessService(businessId: string, input: CreateBusinessServiceInput): Promise<BusinessService> {
    const business = await this.findById(businessId);

    const businessService = this.businessServicesRepository.create({
      businessId: business.id,
      ...input,
    });

    return this.businessServicesRepository.save(businessService);
  }

  async getBusinessServices(businessId: string): Promise<BusinessService[]> {
    return this.businessServicesRepository.find({
      where: { businessId, active: true },
      relations: ['catalogService'],
    });
  }

  async getBusinessServicesByCategory(businessId: string, category: ServiceCategory): Promise<BusinessService[]> {
    return this.businessServicesRepository
      .createQueryBuilder('bs')
      .leftJoinAndSelect('bs.catalogService', 'catalog')
      .where('bs.businessId = :businessId', { businessId })
      .andWhere('bs.active = true')
      .andWhere('catalog.category = :category', { category })
      .getMany();
  }

  async updateAverageRating(businessId: string): Promise<void> {
    const result = await this.businessesRepository
      .createQueryBuilder()
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .from('reviews', 'review')
      .where('review.businessId = :businessId', { businessId })
      .getRawOne();

    await this.businessesRepository.update(businessId, {
      averageRating: parseFloat(result.average) || 0,
      totalReviews: parseInt(result.count) || 0,
    });
  }

  /** Activate or deactivate a business listing. Admin-only operation. */
  async setBusinessActive(businessId: string, active: boolean): Promise<Business> {
    const business = await this.findById(businessId);
    business.active = active;
    return this.businessesRepository.save(business);
  }
}
