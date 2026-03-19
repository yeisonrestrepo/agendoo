import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Amenity } from './entities/amenity.entity';
import { BusinessAmenity } from './entities/business-amenity.entity';
import { AmenitiesService } from './amenities.service';
import { CreateAmenityInput, UpdateAmenityInput, AddAmenityToBusinessInput } from './dto/amenity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';

@Resolver()
export class AmenitiesResolver {
  constructor(
    private amenitiesService: AmenitiesService,
    private businessesService: BusinessesService,
  ) {}

  @Query(() => [Amenity])
  async getAmenities(): Promise<Amenity[]> {
    return this.amenitiesService.findAll();
  }

  @Query(() => Amenity)
  async getAmenity(@Args('id') id: string): Promise<Amenity> {
    return this.amenitiesService.findById(id);
  }

  @Query(() => [BusinessAmenity])
  async getBusinessAmenities(
    @Args('businessId') businessId: string,
  ): Promise<BusinessAmenity[]> {
    return this.amenitiesService.getBusinessAmenities(businessId);
  }

  @Mutation(() => Amenity)
  @UseGuards(JwtAuthGuard)
  async createAmenity(
    @CurrentUser() user: User,
    @Args('input') input: CreateAmenityInput,
  ): Promise<Amenity> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can create amenities');
    }
    return this.amenitiesService.create(input);
  }

  @Mutation(() => Amenity)
  @UseGuards(JwtAuthGuard)
  async updateAmenity(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: UpdateAmenityInput,
  ): Promise<Amenity> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can update amenities');
    }
    return this.amenitiesService.update(id, input);
  }

  @Mutation(() => BusinessAmenity)
  @UseGuards(JwtAuthGuard)
  async addAmenityToBusiness(
    @CurrentUser() user: User,
    @Args('input') input: AddAmenityToBusinessInput,
  ): Promise<BusinessAmenity> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can manage amenities');
    }
    const business = await this.businessesService.findByOwnerId(user.id);
    if (!business) throw new NotFoundException('Business not found');
    return this.amenitiesService.addToBusiness(business.id, input.amenityId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeAmenityFromBusiness(
    @CurrentUser() user: User,
    @Args('businessAmenityId') businessAmenityId: string,
  ): Promise<boolean> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can manage amenities');
    }
    const business = await this.businessesService.findByOwnerId(user.id);
    if (!business) throw new NotFoundException('Business not found');
    return this.amenitiesService.removeFromBusiness(businessAmenityId, business.id);
  }
}
