import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingHistory } from './entities/booking-history.entity';
import { BookingOrigin } from './enums/booking-origin.enum';
import { ActorType } from './enums/actor-type.enum';
import { BusinessService } from '../businesses/entities/business-service.entity';
import { CreateBookingInput } from './dto/booking.dto';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.FINALIZED, BookingStatus.CANCELLED],
  [BookingStatus.FINALIZED]: [],
  [BookingStatus.CANCELLED]: [],
};

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(BookingHistory)
    private historyRepository: Repository<BookingHistory>,
    @InjectRepository(BusinessService)
    private businessServicesRepository: Repository<BusinessService>,
  ) {}

  async create(clientId: string, input: CreateBookingInput): Promise<Booking> {
    const bookingDate = new Date(input.dateTime);
    const now = new Date();

    if (bookingDate <= now) {
      throw new BadRequestException('Booking date must be in the future');
    }

    if (input.rescheduledFromId) {
      const original = await this.bookingsRepository.findOne({ where: { id: input.rescheduledFromId } });
      if (!original) {
        throw new NotFoundException('Original booking not found');
      }
    }

    const businessService = await this.businessServicesRepository.findOne({
      where: { id: input.businessServiceId },
    });

    const durationMinutes = businessService?.duration ?? 0;
    const endDateTime = new Date(bookingDate.getTime() + durationMinutes * 60 * 1000);

    const booking = this.bookingsRepository.create({
      clientId,
      businessId: input.businessId,
      businessServiceId: input.businessServiceId,
      employeeId: input.employeeId,
      dateTime: bookingDate,
      endDateTime,
      notes: input.notes,
      origin: input.origin ?? BookingOrigin.APP_CLIENT,
      rescheduledFromId: input.rescheduledFromId,
    });

    const saved = await this.bookingsRepository.save(booking);

    await this.logTransition(saved.id, BookingStatus.PENDING, BookingStatus.PENDING, clientId, 'Booking created', ActorType.CLIENT);

    return saved;
  }

  async findByClient(clientId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByBusiness(businessId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(bookingId: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateStatus(bookingId: string, newStatus: BookingStatus, userId: string, reason?: string, actorType: ActorType = ActorType.CLIENT): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const allowedTransitions = VALID_TRANSITIONS[booking.status];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ') || 'none (terminal state)'}`,
      );
    }

    const previousStatus = booking.status;
    booking.status = newStatus;

    if (newStatus === BookingStatus.CANCELLED && reason) {
      booking.cancelReason = reason;
    }

    const saved = await this.bookingsRepository.save(booking);

    await this.logTransition(bookingId, previousStatus, newStatus, userId, reason, actorType);

    return saved;
  }

  async getHistory(bookingId: string): Promise<BookingHistory[]> {
    return this.historyRepository.find({
      where: { bookingId },
      relations: ['changedBy', 'changedBy.profile'],
      order: { createdAt: 'ASC' },
    });
  }

  private async logTransition(
    bookingId: string,
    previousStatus: BookingStatus,
    newStatus: BookingStatus,
    changedById: string,
    reason?: string,
    actorType: ActorType = ActorType.CLIENT,
  ): Promise<void> {
    const entry = this.historyRepository.create({
      bookingId,
      previousStatus,
      newStatus,
      changedById,
      reason,
      actorType,
    });

    await this.historyRepository.save(entry);
  }
}
