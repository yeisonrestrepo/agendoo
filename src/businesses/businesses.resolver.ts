import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Business, BusinessType } from './entities/business.entity';
import { BusinessService } from './entities/business-service.entity';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Review } from '../reviews/entities/review.entity';
import { CreateBusinessInput, UpdateBusinessInput, CreateBusinessServiceInput, BusinessFiltersInput } from './dto/business.dto';
import { ServiceCategory } from '../service-catalog/entities/service-catalog.entity';
import { DataloaderService } from '../common/dataloaders/dataloader.service';

@Resolver(() => Business)
export class BusinessesResolver {
  constructor(
    private businessesService: BusinessesService,
    private loaders: DataloaderService,
  ) {}

  @ResolveField(() => User)
  async owner(@Parent() business: Business): Promise<User> {
    if (business.owner) return business.owner;
    return this.loaders.usersById.load(business.ownerId);
  }

  @ResolveField(() => [Employee])
  async employees(@Parent() business: Business): Promise<Employee[]> {
    if (business.employees) return business.employees;
    return this.loaders.employeesByBusinessId.load(business.id);
  }

  @ResolveField(() => [BusinessService])
  async businessServices(@Parent() business: Business): Promise<BusinessService[]> {
    if (business.businessServices) return business.businessServices;
    return this.loaders.businessServicesByBusinessId.load(business.id);
  }

  @ResolveField(() => [Review])
  async reviews(@Parent() business: Business): Promise<Review[]> {
    if (business.reviews) return business.reviews;
    return this.loaders.reviewsByBusinessId.load(business.id);
  }

  @Query(() => Business, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getMyBusiness(@CurrentUser() user: User): Promise<Business | null> {
    return this.businessesService.findByOwnerId(user.id);
  }

  @Query(() => [Business])
  async getBusinesses(
    @Args('filters', { nullable: true }) filters?: BusinessFiltersInput
  ): Promise<Business[]> {
    if (filters) {
      return this.businessesService.findWithFilters(filters);
    }
    return this.businessesService.findAll();
  }

  @Query(() => [Business])
  async getBusinessesByType(
    @Args('type', { type: () => BusinessType }) type: BusinessType
  ): Promise<Business[]> {
    return this.businessesService.findByType(type);
  }

  @Query(() => Business)
  async getBusiness(@Args('id') id: string): Promise<Business> {
    return this.businessesService.findById(id);
  }

  @Query(() => [BusinessService])
  async getBusinessServices(@Args('businessId') businessId: string): Promise<BusinessService[]> {
    return this.businessesService.getBusinessServices(businessId);
  }

  @Query(() => [BusinessService])
  async getBusinessServicesByCategory(
    @Args('businessId') businessId: string,
    @Args('category', { type: () => ServiceCategory }) category: ServiceCategory
  ): Promise<BusinessService[]> {
    return this.businessesService.getBusinessServicesByCategory(businessId, category);
  }

  @Mutation(() => Business)
  @UseGuards(JwtAuthGuard)
  async createBusiness(
    @CurrentUser() user: User,
    @Args('input') input: CreateBusinessInput,
  ): Promise<Business> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can create a business profile');
    }
    return this.businessesService.create(user.id, input);
  }

  @Mutation(() => Business)
  @UseGuards(JwtAuthGuard)
  async updateBusiness(
    @CurrentUser() user: User,
    @Args('input') input: UpdateBusinessInput,
  ): Promise<Business> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can update a business profile');
    }
    return this.businessesService.update(user.id, input);
  }

  @Mutation(() => BusinessService)
  @UseGuards(JwtAuthGuard)
  async createBusinessService(
    @CurrentUser() user: User,
    @Args('input') input: CreateBusinessServiceInput,
  ): Promise<BusinessService> {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can create services');
    }

    const business = await this.businessesService.findByOwnerId(user.id);
    if (!business) {
      throw new NotFoundException('Business profile not found');
    }

    return this.businessesService.createBusinessService(business.id, input);
  }

  @Query(() => [Business])
  async getBarbers(): Promise<Business[]> {
    return this.businessesService.findByType(BusinessType.BARBER);
  }

  @Query(() => [Business])
  async getNailArtists(): Promise<Business[]> {
    return this.businessesService.findByType(BusinessType.NAIL_ARTIST);
  }

  @Query(() => [Business])
  async getMakeupArtists(): Promise<Business[]> {
    return this.businessesService.findByType(BusinessType.MAKEUP_ARTIST);
  }

  @Query(() => [Business])
  async getBeautySalons(): Promise<Business[]> {
    return this.businessesService.findByType(BusinessType.BEAUTY_SALON);
  }

  @Mutation(() => Business)
  @UseGuards(JwtAuthGuard)
  async setBusinessActive(
    @CurrentUser() user: User,
    @Args('businessId', { type: () => ID }) businessId: string,
    @Args('active') active: boolean,
  ): Promise<Business> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change business listing status');
    }
    return this.businessesService.setBusinessActive(businessId, active);
  }
}
