import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Professional, ProfessionalType } from './entities/professional.entity';
import { Service, ServiceCategory } from './entities/service.entity';
import { ProfessionalsService } from './professionals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateServiceInput, ProfessionalFiltersInput } from './dto/professional.dto';

@Resolver(() => Professional)
export class ProfessionalsResolver {
  constructor(private professionalsService: ProfessionalsService) {}

  @Query(() => [Professional])
  async getProfessionals(
    @Args('filters', { nullable: true }) filters?: ProfessionalFiltersInput
  ): Promise<Professional[]> {
    if (filters) {
      return this.professionalsService.findProfessionalsWithFilters(filters);
    }
    return this.professionalsService.findAll();
  }

  @Query(() => [Professional])
  async getProfessionalsByType(
    @Args('type', { type: () => ProfessionalType }) type: ProfessionalType
  ): Promise<Professional[]> {
    return this.professionalsService.findByType(type);
  }

  @Query(() => Professional)
  async getProfessional(@Args('id') id: string): Promise<Professional> {
    return this.professionalsService.findById(id);
  }

  @Query(() => [Service])
  async getServices(@Args('professionalId') professionalId: string): Promise<Service[]> {
    return this.professionalsService.getServices(professionalId);
  }

  @Query(() => [Service])
  async getServicesByCategory(
    @Args('professionalId') professionalId: string,
    @Args('category', { type: () => ServiceCategory }) category: ServiceCategory
  ): Promise<Service[]> {
    return this.professionalsService.getServicesByCategory(professionalId, category);
  }

  @Mutation(() => Service)
  @UseGuards(JwtAuthGuard)
  async createService(
    @CurrentUser() user: User,
    @Args('input') input: CreateServiceInput,
  ): Promise<Service> {
    if (user.role !== UserRole.BARBER) {
      throw new Error('Only beauty professionals can create services');
    }

    const professional = await this.professionalsService.findByUserId(user.id);
    if (!professional) {
      throw new Error('Professional profile not found');
    }

    return this.professionalsService.createService(professional.id, input);
  }

  // Queries específicas para diferentes tipos de profesionales
  @Query(() => [Professional])
  async getBarbers(): Promise<Professional[]> {
    return this.professionalsService.findByType(ProfessionalType.BARBER);
  }

  @Query(() => [Professional])
  async getNailArtists(): Promise<Professional[]> {
    return this.professionalsService.findByType(ProfessionalType.NAIL_ARTIST);
  }

  @Query(() => [Professional])
  async getMakeupArtists(): Promise<Professional[]> {
    return this.professionalsService.findByType(ProfessionalType.MAKEUP_ARTIST);
  }

  @Query(() => [Professional])
  async getBeautySalons(): Promise<Professional[]> {
    return this.professionalsService.findByType(ProfessionalType.BEAUTY_SALON);
  }
}