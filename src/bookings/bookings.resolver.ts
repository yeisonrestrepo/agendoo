import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingHistory } from './entities/booking-history.entity';
import { ActorType } from './enums/actor-type.enum';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';
import { BusinessService } from '../businesses/entities/business-service.entity';
import { Employee } from '../employees/entities/employee.entity';
import { CreateBookingInput } from './dto/booking.dto';
import { BusinessesService } from '../businesses/businesses.service';
import { DataloaderService } from '../common/dataloaders/dataloader.service';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(
    private bookingsService: BookingsService,
    private businessesService: BusinessesService,
    private loaders: DataloaderService,
  ) {}

  @ResolveField(() => User)
  async client(@Parent() booking: Booking): Promise<User> {
    if (booking.client) return booking.client;
    return this.loaders.usersById.load(booking.clientId);
  }

  @ResolveField(() => Business)
  async business(@Parent() booking: Booking): Promise<Business> {
    if (booking.business) return booking.business;
    return this.loaders.businessesById.load(booking.businessId);
  }

  @ResolveField(() => BusinessService)
  async businessService(@Parent() booking: Booking): Promise<BusinessService> {
    if (booking.businessService) return booking.businessService;
    return this.loaders.businessServicesById.load(booking.businessServiceId);
  }

  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() booking: Booking): Promise<Employee | null> {
    if (booking.employee) return booking.employee;
    if (!booking.employeeId) return null;
    return this.loaders.employeesById.load(booking.employeeId);
  }

  @Mutation(() => Booking)
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Args('input') input: CreateBookingInput,
  ): Promise<Booking> {
    return this.bookingsService.create(user.id, input);
  }

  @Query(() => Booking)
  @UseGuards(JwtAuthGuard)
  async getBooking(@Args('bookingId') bookingId: string): Promise<Booking> {
    return this.bookingsService.findById(bookingId);
  }

  @Query(() => [Booking])
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@CurrentUser() user: User): Promise<Booking[]> {
    if (user.role === UserRole.BUSINESS_OWNER) {
      const business = await this.businessesService.findByOwnerId(user.id);
      if (business) {
        return this.bookingsService.findByBusiness(business.id);
      }
      return [];
    }
    return this.bookingsService.findByClient(user.id);
  }

  @Mutation(() => Booking)
  @UseGuards(JwtAuthGuard)
  async updateBookingStatus(
    @CurrentUser() user: User,
    @Args('bookingId') bookingId: string,
    @Args('status', { type: () => BookingStatus }) status: BookingStatus,
    @Args('reason', { nullable: true }) reason?: string,
    @Args('actorType', { type: () => ActorType, nullable: true }) actorType?: ActorType,
  ): Promise<Booking> {
    const resolvedActor = actorType ?? (user.role === UserRole.BUSINESS_OWNER ? ActorType.BUSINESS : ActorType.CLIENT);
    return this.bookingsService.updateStatus(bookingId, status, user.id, reason, resolvedActor);
  }

  @Query(() => [BookingHistory])
  @UseGuards(JwtAuthGuard)
  async getBookingHistory(@Args('bookingId') bookingId: string): Promise<BookingHistory[]> {
    return this.bookingsService.getHistory(bookingId);
  }
}
