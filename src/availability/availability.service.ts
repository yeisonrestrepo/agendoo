import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, FindOptionsWhere } from 'typeorm';
import { BusinessHours } from './entities/business-hours.entity';
import { EmployeeSchedule } from './entities/employee-schedule.entity';
import { ScheduleException } from './entities/schedule-exception.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { BusinessService } from '../businesses/entities/business-service.entity';
import { Employee } from '../employees/entities/employee.entity';
import { EmployeeService as EmployeeServiceEntity } from '../employees/entities/employee-service.entity';
import {
  SetBusinessHoursInput,
  SetEmployeeScheduleInput,
  CreateScheduleExceptionInput,
  TimeSlot,
} from './dto/availability.dto';

interface TimeRange {
  /** Minutes elapsed from midnight (0–1439). */
  start: number;
  end: number;
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(BusinessHours)
    private businessHoursRepository: Repository<BusinessHours>,
    @InjectRepository(EmployeeSchedule)
    private employeeScheduleRepository: Repository<EmployeeSchedule>,
    @InjectRepository(ScheduleException)
    private exceptionRepository: Repository<ScheduleException>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(BusinessService)
    private businessServicesRepository: Repository<BusinessService>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(EmployeeServiceEntity)
    private employeeServicesRepository: Repository<EmployeeServiceEntity>,
  ) {}

  async getAvailableSlots(
    businessId: string,
    businessServiceId: string,
    date: string,
    employeeId?: string,
  ): Promise<TimeSlot[]> {
    const businessService = await this.businessServicesRepository.findOne({
      where: { id: businessServiceId, businessId },
    });

    if (!businessService) {
      throw new NotFoundException('Business service not found');
    }

    if (employeeId) {
      return this.getSlotsForEmployee(businessId, businessService, date, employeeId);
    }

    return this.getSlotsForAnyEmployee(businessId, businessService, date);
  }

  private async getSlotsForEmployee(
    businessId: string,
    businessService: BusinessService,
    date: string,
    employeeId: string,
  ): Promise<TimeSlot[]> {
    const employee = await this.employeesRepository.findOne({
      where: { id: employeeId, businessId, active: true },
      relations: ['user', 'user.profile'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const duration = await this.getEffectiveDuration(businessService, employeeId);
    const totalBlock = (businessService.bufferBefore ?? 0) + duration + (businessService.bufferAfter ?? 0);
    const availableMinutes = await this.getAvailableMinutes(businessId, employeeId, date, totalBlock);

    const bufferBefore = businessService.bufferBefore ?? 0;
    return availableMinutes.map(startMin => this.minutesToTimeSlot(date, startMin + bufferBefore, duration, employee));
  }

  private async getSlotsForAnyEmployee(
    businessId: string,
    businessService: BusinessService,
    date: string,
  ): Promise<TimeSlot[]> {
    const eligibleEmployees = await this.getEligibleEmployees(businessId, businessService.id);

    if (eligibleEmployees.length === 0) {
      return [];
    }

    const slotMap = new Map<number, TimeSlot>();

    const bufferBefore = businessService.bufferBefore ?? 0;
    const bufferAfter = businessService.bufferAfter ?? 0;

    for (const employee of eligibleEmployees) {
      const duration = await this.getEffectiveDuration(businessService, employee.id);
      const totalBlock = bufferBefore + duration + bufferAfter;
      const availableMinutes = await this.getAvailableMinutes(businessId, employee.id, date, totalBlock);

      for (const startMin of availableMinutes) {
        const clientStart = startMin + bufferBefore;
        if (!slotMap.has(clientStart)) {
          slotMap.set(clientStart, this.minutesToTimeSlot(date, clientStart, duration, employee));
        }
      }
    }

    return Array.from(slotMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, slot]) => slot);
  }

  private async getAvailableMinutes(
    businessId: string,
    employeeId: string,
    date: string,
    serviceDuration: number,
  ): Promise<number[]> {
    const dateObj = new Date(date);
    const jsDay = dateObj.getUTCDay();
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    const businessHours = await this.businessHoursRepository.findOne({
      where: { businessId, dayOfWeek },
    });

    if (!businessHours || !businessHours.isOpen) {
      return [];
    }

    const businessRange = this.parseTimeRange(businessHours.openTime, businessHours.closeTime);

    const employeeSchedule = await this.employeeScheduleRepository.findOne({
      where: { employeeId, dayOfWeek },
    });

    if (!employeeSchedule || !employeeSchedule.isWorking) {
      return [];
    }

    const employeeRange = this.parseTimeRange(employeeSchedule.startTime, employeeSchedule.endTime);

    const workingRange = this.intersectRanges(businessRange, employeeRange);
    if (!workingRange) {
      return [];
    }

    const breakRanges = [
      ...(businessHours.breaks ?? []).map(b => this.parseTimeRange(b.start, b.end)),
      ...(employeeSchedule.breaks ?? []).map(b => this.parseTimeRange(b.start, b.end)),
    ];
    const blockedRanges = await this.getBlockedRanges(businessId, employeeId, date);
    const bookedRanges = await this.getBookedRanges(employeeId, date);
    const allBlocked = [...breakRanges, ...blockedRanges, ...bookedRanges];

    return this.generateSlotStarts(workingRange, allBlocked, serviceDuration);
  }

  private async getEffectiveDuration(businessService: BusinessService, employeeId: string): Promise<number> {
    const employeeService = await this.employeeServicesRepository.findOne({
      where: { employeeId, businessServiceId: businessService.id, active: true },
    });

    return employeeService?.customDuration ?? businessService.duration;
  }

  private async getEligibleEmployees(businessId: string, businessServiceId: string): Promise<Employee[]> {
    const employeeServices = await this.employeeServicesRepository.find({
      where: { businessServiceId, active: true },
      relations: ['employee', 'employee.user', 'employee.user.profile'],
    });

    const assigned = employeeServices
      .filter(es => es.employee.businessId === businessId && es.employee.active)
      .map(es => es.employee);

    if (assigned.length > 0) {
      return assigned;
    }

    return this.employeesRepository.find({
      where: { businessId, active: true },
      relations: ['user', 'user.profile'],
    });
  }

  /**
   * Returns blocked {@link TimeRange} entries for a given business/employee/date combination.
   * An exception without `startTime`/`endTime` blocks the entire day.
   */
  private async getBlockedRanges(businessId: string, employeeId: string, date: string): Promise<TimeRange[]> {
    const exceptions = await this.exceptionRepository.find({
      where: [
        { businessId, date },
        { employeeId, date },
      ],
    });

    const ranges: TimeRange[] = [];

    for (const ex of exceptions) {
      if (!ex.startTime || !ex.endTime) {
        ranges.push({ start: 0, end: 24 * 60 });
      } else {
        ranges.push(this.parseTimeRange(ex.startTime, ex.endTime));
      }
    }

    return ranges;
  }

  /**
   * Returns {@link TimeRange} entries occupied by existing bookings for an employee on a given date.
   * Uses UTC boundaries to stay consistent with the `getUTCDay()` calls in availability calculations.
   */
  private async getBookedRanges(employeeId: string, date: string): Promise<TimeRange[]> {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const bookings = await this.bookingsRepository.find({
      where: {
        employeeId,
        dateTime: Between(dayStart, dayEnd),
        status: In([BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]),
      },
      relations: ['businessService'],
    });

    return bookings.map(booking => {
      const startMin = booking.dateTime.getUTCHours() * 60 + booking.dateTime.getUTCMinutes();
      const duration = booking.businessService?.duration ?? 30;
      const bufBefore = booking.businessService?.bufferBefore ?? 0;
      const bufAfter = booking.businessService?.bufferAfter ?? 0;
      return { start: startMin - bufBefore, end: startMin + duration + bufAfter };
    });
  }

  private parseTimeRange(startTime: string, endTime: string): TimeRange {
    return {
      start: this.timeToMinutes(startTime),
      end: this.timeToMinutes(endTime),
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private intersectRanges(a: TimeRange, b: TimeRange): TimeRange | null {
    const start = Math.max(a.start, b.start);
    const end = Math.min(a.end, b.end);
    return start < end ? { start, end } : null;
  }

  private generateSlotStarts(
    workingRange: TimeRange,
    blockedRanges: TimeRange[],
    duration: number,
    slotInterval: number = 15,
  ): number[] {
    const slots: number[] = [];

    for (let start = workingRange.start; start + duration <= workingRange.end; start += slotInterval) {
      const slotEnd = start + duration;
      const isBlocked = blockedRanges.some(
        blocked => start < blocked.end && slotEnd > blocked.start,
      );

      if (!isBlocked) {
        slots.push(start);
      }
    }

    return slots;
  }

  private minutesToTimeSlot(date: string, startMin: number, duration: number, employee: Employee): TimeSlot {
    const startHours = Math.floor(startMin / 60);
    const startMins = startMin % 60;
    const endMin = startMin + duration;
    const endHours = Math.floor(endMin / 60);
    const endMins = endMin % 60;

    return {
      startTime: `${date}T${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}:00`,
      endTime: `${date}T${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}:00`,
      employeeId: employee.id,
      employee,
    };
  }

  async setBusinessHours(businessId: string, input: SetBusinessHoursInput): Promise<BusinessHours> {
    let hours = await this.businessHoursRepository.findOne({
      where: { businessId, dayOfWeek: input.dayOfWeek },
    });

    if (hours) {
      hours.openTime = input.openTime;
      hours.closeTime = input.closeTime;
      hours.isOpen = input.isOpen ?? true;
      hours.breaks = input.breaks ?? [];
    } else {
      hours = this.businessHoursRepository.create({
        businessId,
        dayOfWeek: input.dayOfWeek,
        openTime: input.openTime,
        closeTime: input.closeTime,
        isOpen: input.isOpen ?? true,
        breaks: input.breaks ?? [],
      });
    }

    return this.businessHoursRepository.save(hours);
  }

  async getBusinessHours(businessId: string): Promise<BusinessHours[]> {
    return this.businessHoursRepository.find({
      where: { businessId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async setEmployeeSchedule(businessId: string, input: SetEmployeeScheduleInput): Promise<EmployeeSchedule> {
    const employee = await this.employeesRepository.findOne({
      where: { id: input.employeeId, businessId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found in this business');
    }

    let schedule = await this.employeeScheduleRepository.findOne({
      where: { employeeId: input.employeeId, dayOfWeek: input.dayOfWeek },
    });

    if (schedule) {
      schedule.startTime = input.startTime;
      schedule.endTime = input.endTime;
      schedule.isWorking = input.isWorking ?? true;
      schedule.breaks = input.breaks ?? [];
    } else {
      schedule = this.employeeScheduleRepository.create({
        employeeId: input.employeeId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        isWorking: input.isWorking ?? true,
        breaks: input.breaks ?? [],
      });
    }

    return this.employeeScheduleRepository.save(schedule);
  }

  async getEmployeeSchedule(employeeId: string): Promise<EmployeeSchedule[]> {
    return this.employeeScheduleRepository.find({
      where: { employeeId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async createException(businessId: string, input: CreateScheduleExceptionInput): Promise<ScheduleException> {
    if (input.employeeId) {
      const employee = await this.employeesRepository.findOne({
        where: { id: input.employeeId, businessId },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found in this business');
      }
    }

    const exception = this.exceptionRepository.create({
      businessId: input.employeeId ? undefined : businessId,
      employeeId: input.employeeId,
      date: input.date,
      type: input.type,
      startTime: input.startTime,
      endTime: input.endTime,
      reason: input.reason,
    });

    return this.exceptionRepository.save(exception);
  }

  async getExceptions(businessId: string, date?: string): Promise<ScheduleException[]> {
    const where: FindOptionsWhere<ScheduleException>[] = [{ businessId }];

    const employees = await this.employeesRepository.find({ where: { businessId } });
    const employeeIds = employees.map(e => e.id);

    for (const empId of employeeIds) {
      where.push({ employeeId: empId });
    }

    const exceptions = await this.exceptionRepository.find({ where });

    if (date) {
      return exceptions.filter(e => e.date === date);
    }

    return exceptions;
  }

  async deleteException(exceptionId: string): Promise<boolean> {
    const exception = await this.exceptionRepository.findOne({
      where: { id: exceptionId },
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    await this.exceptionRepository.remove(exception);
    return true;
  }
}
