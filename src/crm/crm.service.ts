import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientNote } from './entities/client-note.entity';
import { CancellationPolicy } from './entities/cancellation-policy.entity';
import { BusinessClient } from './entities/business-client.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { BookingOrigin } from '../bookings/enums/booking-origin.enum';
import { ActorType } from '../bookings/enums/actor-type.enum';
import { BookingHistory } from '../bookings/entities/booking-history.entity';
import { BusinessService as BusinessServiceEntity } from '../businesses/entities/business-service.entity';
import {
  CreateClientNoteInput,
  UpdateClientNoteInput,
  CreateCancellationPolicyInput,
  UpdateCancellationPolicyInput,
  CreateManualBookingInput,
  ClientVisitSummary,
} from './dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(ClientNote)
    private notesRepository: Repository<ClientNote>,
    @InjectRepository(CancellationPolicy)
    private policiesRepository: Repository<CancellationPolicy>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(BookingHistory)
    private historyRepository: Repository<BookingHistory>,
    @InjectRepository(BusinessClient)
    private businessClientsRepository: Repository<BusinessClient>,
    @InjectRepository(BusinessServiceEntity)
    private businessServicesRepository: Repository<BusinessServiceEntity>,
  ) {}

  async createNote(businessId: string, createdById: string, input: CreateClientNoteInput): Promise<ClientNote> {
    const note = this.notesRepository.create({
      businessId,
      clientId: input.clientId,
      createdById,
      content: input.content,
    });

    return this.notesRepository.save(note);
  }

  async updateNote(noteId: string, businessId: string, input: UpdateClientNoteInput): Promise<ClientNote> {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, businessId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    note.content = input.content;
    return this.notesRepository.save(note);
  }

  async deleteNote(noteId: string, businessId: string): Promise<boolean> {
    const note = await this.notesRepository.findOne({
      where: { id: noteId, businessId },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.notesRepository.remove(note);
    return true;
  }

  async getNotesByClient(businessId: string, clientId: string): Promise<ClientNote[]> {
    return this.notesRepository.find({
      where: { businessId, clientId },
      order: { createdAt: 'DESC' },
    });
  }

  async getClientVisitHistory(businessId: string, clientId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: {
        businessId,
        clientId,
        status: BookingStatus.FINALIZED,
      },
      order: { dateTime: 'DESC' },
    });
  }

  async getClientVisitSummary(businessId: string, clientId: string): Promise<ClientVisitSummary> {
    const result = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.businessService', 'bs')
      .select('COUNT(booking.id)', 'totalVisits')
      .addSelect('COALESCE(SUM(bs.price), 0)', 'totalSpent')
      .addSelect('MAX(booking.dateTime)', 'lastVisitDate')
      .addSelect('MIN(booking.dateTime)', 'firstVisitDate')
      .where('booking.businessId = :businessId', { businessId })
      .andWhere('booking.clientId = :clientId', { clientId })
      .andWhere('booking.status = :status', { status: BookingStatus.FINALIZED })
      .getRawOne();

    return Object.assign(new ClientVisitSummary(), {
      clientId,
      totalVisits: parseInt(result.totalVisits) || 0,
      totalSpent: parseFloat(result.totalSpent) || 0,
      lastVisitDate: result.lastVisitDate ? new Date(result.lastVisitDate) : undefined,
      firstVisitDate: result.firstVisitDate ? new Date(result.firstVisitDate) : undefined,
    });
  }

  async getBusinessClients(businessId: string): Promise<ClientVisitSummary[]> {
    const results = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.businessService', 'bs')
      .select('booking.clientId', 'clientId')
      .addSelect('COUNT(booking.id)', 'totalVisits')
      .addSelect('COALESCE(SUM(bs.price), 0)', 'totalSpent')
      .addSelect('MAX(booking.dateTime)', 'lastVisitDate')
      .addSelect('MIN(booking.dateTime)', 'firstVisitDate')
      .where('booking.businessId = :businessId', { businessId })
      .andWhere('booking.status = :status', { status: BookingStatus.FINALIZED })
      .groupBy('booking.clientId')
      .orderBy('"totalVisits"', 'DESC')
      .getRawMany();

    return results.map(r =>
      Object.assign(new ClientVisitSummary(), {
        clientId: r.clientId as string,
        totalVisits: parseInt(r.totalVisits) || 0,
        totalSpent: parseFloat(r.totalSpent) || 0,
        lastVisitDate: r.lastVisitDate ? new Date(r.lastVisitDate) : undefined,
        firstVisitDate: r.firstVisitDate ? new Date(r.firstVisitDate) : undefined,
      }),
    );
  }

  async createManualBooking(businessId: string, createdById: string, input: CreateManualBookingInput): Promise<Booking> {
    const dateTime = new Date(input.dateTime);

    const businessService = await this.businessServicesRepository.findOne({ where: { id: input.businessServiceId } });
    const endDateTime = businessService
      ? new Date(dateTime.getTime() + businessService.duration * 60 * 1000)
      : undefined;

    const booking = this.bookingsRepository.create({
      clientId: input.clientId,
      businessId,
      businessServiceId: input.businessServiceId,
      employeeId: input.employeeId,
      dateTime: dateTime,
      endDateTime,
      notes: input.notes ? `[Manual] ${input.notes}` : '[Manual]',
      status: BookingStatus.CONFIRMED,
      origin: BookingOrigin.MANUAL,
    });

    const saved = await this.bookingsRepository.save(booking);

    const historyEntry = this.historyRepository.create({
      bookingId: saved.id,
      previousStatus: BookingStatus.CONFIRMED,
      newStatus: BookingStatus.CONFIRMED,
      changedById: createdById,
      actorType: ActorType.BUSINESS,
      reason: 'Manual booking created by staff',
    });
    await this.historyRepository.save(historyEntry);

    return saved;
  }

  async createPolicy(businessId: string, input: CreateCancellationPolicyInput): Promise<CancellationPolicy> {
    const policy = this.policiesRepository.create({
      businessId,
      ...input,
    });

    return this.policiesRepository.save(policy);
  }

  async updatePolicy(policyId: string, businessId: string, input: UpdateCancellationPolicyInput): Promise<CancellationPolicy> {
    const policy = await this.policiesRepository.findOne({
      where: { id: policyId, businessId },
    });

    if (!policy) {
      throw new NotFoundException('Cancellation policy not found');
    }

    if (input.name !== undefined) policy.name = input.name;
    if (input.description !== undefined) policy.description = input.description;
    if (input.hoursBeforeBooking !== undefined) policy.hoursBeforeBooking = input.hoursBeforeBooking;
    if (input.penaltyPercentage !== undefined) policy.penaltyPercentage = input.penaltyPercentage;
    if (input.active !== undefined) policy.active = input.active;

    return this.policiesRepository.save(policy);
  }

  async deletePolicy(policyId: string, businessId: string): Promise<boolean> {
    const policy = await this.policiesRepository.findOne({
      where: { id: policyId, businessId },
    });

    if (!policy) {
      throw new NotFoundException('Cancellation policy not found');
    }

    await this.policiesRepository.remove(policy);
    return true;
  }

  async getPolicies(businessId: string): Promise<CancellationPolicy[]> {
    return this.policiesRepository.find({
      where: { businessId, active: true },
      order: { hoursBeforeBooking: 'DESC' },
    });
  }

  async checkCancellationPenalty(bookingId: string): Promise<{ canCancel: boolean; penaltyPercentage: number }> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const policies = await this.policiesRepository.find({
      where: { businessId: booking.businessId, active: true },
      order: { hoursBeforeBooking: 'DESC' },
    });

    if (policies.length === 0) {
      return { canCancel: true, penaltyPercentage: 0 };
    }

    const hoursUntilBooking = (booking.dateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const applicablePolicy = policies.find(p => hoursUntilBooking < p.hoursBeforeBooking);

    if (!applicablePolicy) {
      return { canCancel: true, penaltyPercentage: 0 };
    }

    return {
      canCancel: true,
      penaltyPercentage: Number(applicablePolicy.penaltyPercentage),
    };
  }

  // ── BusinessClient (alias/CRM record) ────────────────────────────────────────

  async upsertBusinessClient(businessId: string, clientId: string, alias?: string): Promise<BusinessClient> {
    let record = await this.businessClientsRepository.findOne({ where: { businessId, clientId } });

    if (record) {
      if (alias !== undefined) record.alias = alias;
      return this.businessClientsRepository.save(record);
    }

    record = this.businessClientsRepository.create({ businessId, clientId, alias });
    return this.businessClientsRepository.save(record);
  }

  async getBusinessClient(businessId: string, clientId: string): Promise<BusinessClient | null> {
    return this.businessClientsRepository.findOne({ where: { businessId, clientId } });
  }

  async getAllBusinessClients(businessId: string): Promise<BusinessClient[]> {
    return this.businessClientsRepository.find({
      where: { businessId },
      order: { createdAt: 'ASC' },
    });
  }
}
