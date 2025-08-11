import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingInput } from './dto/booking.dto';

@Resolver(() => Booking)
export class BookingsResolver {
  constructor(private bookingsService: BookingsService) {}

  @Mutation(() => Booking)
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @CurrentUser() user: User,
    @Args('input') input: CreateBookingInput,
  ): Promise<Booking> {
    return this.bookingsService.create(user.id, input);
  }

  @Query(() => [Booking])
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@CurrentUser() user: User): Promise<Booking[]> {
    const isBarber = user.role === UserRole.BARBER;
    return this.bookingsService.findByUser(user.id, isBarber);
  }

  @Mutation(() => Booking)
  @UseGuards(JwtAuthGuard)
  async updateBookingStatus(
    @Args('bookingId') bookingId: string,
    @Args('status', { type: () => BookingStatus }) status: BookingStatus,
  ): Promise<Booking> {
    return this.bookingsService.updateStatus(bookingId, status);
  }
}