import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingInput } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(clientId: string, input: CreateBookingInput): Promise<Booking> {
    const bookingDate = new Date(input.dateTime);
    const now = new Date();

    if (bookingDate <= now) {
      throw new BadRequestException('La fecha debe ser futura');
    }

    const booking = this.bookingsRepository.create({
      clientId,
      barberId: input.barberId,
      serviceId: input.serviceId,
      dateTime: bookingDate,
      notes: input.notes,
    });

    return this.bookingsRepository.save(booking);
  }

  async findByUser(userId: string, isBarber: boolean = false): Promise<Booking[]> {
    const whereCondition = isBarber ? { barberId: userId } : { clientId: userId };
    
    return this.bookingsRepository.find({
      where: whereCondition,
      relations: ['client', 'client.profile', 'barber', 'barber.user', 'barber.user.profile', 'service'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada');
    }

    booking.status = status;
    return this.bookingsRepository.save(booking);
  }
}