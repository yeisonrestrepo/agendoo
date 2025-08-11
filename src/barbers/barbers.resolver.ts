import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Barber } from './entities/barber.entity';
import { Service } from './entities/service.entity';
import { BarbersService } from './barbers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateServiceInput } from './dto/barber.dto';

@Resolver(() => Barber)
export class BarbersResolver {
  constructor(private barbersService: BarbersService) {}

  @Query(() => [Barber])
  async getBarbers(): Promise<Barber[]> {
    return this.barbersService.findAll();
  }

  @Query(() => Barber)
  async getBarber(@Args('id') id: string): Promise<Barber> {
    return this.barbersService.findById(id);
  }

  @Query(() => [Service])
  async getServices(@Args('barberId') barberId: string): Promise<Service[]> {
    return this.barbersService.getServices(barberId);
  }

  @Mutation(() => Service)
  @UseGuards(JwtAuthGuard)
  async createService(
    @CurrentUser() user: User,
    @Args('input') input: CreateServiceInput,
  ): Promise<Service> {
    if (user.role !== UserRole.BARBER) {
      throw new Error('Solo los barberos pueden crear servicios');
    }

    const barber = await this.barbersService.findByUserId(user.id);
    if (!barber) {
      throw new Error('Perfil de barbero no encontrado');
    }

    return this.barbersService.createService(barber.id, input);
  }
}