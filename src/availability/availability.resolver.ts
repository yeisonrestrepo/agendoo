import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { BusinessHours } from './entities/business-hours.entity';
import { EmployeeSchedule } from './entities/employee-schedule.entity';
import { ScheduleException } from './entities/schedule-exception.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';
import {
  GetAvailableSlotsInput,
  SetBusinessHoursInput,
  SetEmployeeScheduleInput,
  CreateScheduleExceptionInput,
  TimeSlot,
} from './dto/availability.dto';

@Resolver()
export class AvailabilityResolver {
  constructor(
    private availabilityService: AvailabilityService,
    private businessesService: BusinessesService,
  ) {}

  @Query(() => [TimeSlot])
  async getAvailableSlots(
    @Args('input') input: GetAvailableSlotsInput,
  ): Promise<TimeSlot[]> {
    return this.availabilityService.getAvailableSlots(
      input.businessId,
      input.businessServiceId,
      input.date,
      input.employeeId,
    );
  }

  @Query(() => [BusinessHours])
  async getBusinessHours(
    @Args('businessId') businessId: string,
  ): Promise<BusinessHours[]> {
    return this.availabilityService.getBusinessHours(businessId);
  }

  @Query(() => [EmployeeSchedule])
  async getEmployeeSchedule(
    @Args('employeeId') employeeId: string,
  ): Promise<EmployeeSchedule[]> {
    return this.availabilityService.getEmployeeSchedule(employeeId);
  }

  @Query(() => [ScheduleException])
  async getScheduleExceptions(
    @Args('businessId') businessId: string,
    @Args('date', { nullable: true }) date?: string,
  ): Promise<ScheduleException[]> {
    return this.availabilityService.getExceptions(businessId, date);
  }

  @Mutation(() => BusinessHours)
  @UseGuards(JwtAuthGuard)
  async setBusinessHours(
    @CurrentUser() user: User,
    @Args('input') input: SetBusinessHoursInput,
  ): Promise<BusinessHours> {
    const business = await this.requireBusinessOwner(user);
    return this.availabilityService.setBusinessHours(business.id, input);
  }

  @Mutation(() => [BusinessHours])
  @UseGuards(JwtAuthGuard)
  async setWeeklyBusinessHours(
    @CurrentUser() user: User,
    @Args('inputs', { type: () => [SetBusinessHoursInput] }) inputs: SetBusinessHoursInput[],
  ): Promise<BusinessHours[]> {
    const business = await this.requireBusinessOwner(user);
    const results: BusinessHours[] = [];

    for (const input of inputs) {
      results.push(await this.availabilityService.setBusinessHours(business.id, input));
    }

    return results;
  }

  @Mutation(() => EmployeeSchedule)
  @UseGuards(JwtAuthGuard)
  async setEmployeeSchedule(
    @CurrentUser() user: User,
    @Args('input') input: SetEmployeeScheduleInput,
  ): Promise<EmployeeSchedule> {
    const business = await this.requireBusinessOwner(user);
    return this.availabilityService.setEmployeeSchedule(business.id, input);
  }

  @Mutation(() => ScheduleException)
  @UseGuards(JwtAuthGuard)
  async createScheduleException(
    @CurrentUser() user: User,
    @Args('input') input: CreateScheduleExceptionInput,
  ): Promise<ScheduleException> {
    const business = await this.requireBusinessOwner(user);
    return this.availabilityService.createException(business.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteScheduleException(
    @CurrentUser() user: User,
    @Args('exceptionId') exceptionId: string,
  ): Promise<boolean> {
    await this.requireBusinessOwner(user);
    return this.availabilityService.deleteException(exceptionId);
  }

  private async requireBusinessOwner(user: User) {
    if (user.role !== UserRole.BUSINESS_OWNER) {
      throw new ForbiddenException('Only business owners can manage availability');
    }

    const business = await this.businessesService.findByOwnerId(user.id);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }
}
