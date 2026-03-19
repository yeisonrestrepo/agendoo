import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { BusinessService } from '../../businesses/entities/business-service.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { BookingHistory } from './booking-history.entity';
import { BookingStatus } from '../enums/booking-status.enum';
import { BookingOrigin } from '../enums/booking-origin.enum';

export { BookingStatus };

@Entity('bookings')
@Index(['clientId', 'status'])
@Index(['businessId', 'status'])
@Index(['employeeId', 'dateTime'])
@Index(['updatedAt'])
@ObjectType()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  clientId: string;

  @Column()
  businessId: string;

  @Column()
  businessServiceId: string;

  @Column({ nullable: true })
  employeeId?: string;

  @Column()
  @Field()
  dateTime: Date;

  /** Pre-computed end time (dateTime + service duration). Stored to enable direct range queries. */
  @Column({ type: 'timestamp', nullable: true })
  @Field({ nullable: true })
  endDateTime?: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    enumName: 'booking_status',
    default: BookingStatus.PENDING,
  })
  @Field(() => BookingStatus)
  status: BookingStatus;

  /** Whether the booking was created by the client app or manually by the business. */
  @Column({
    type: 'enum',
    enum: BookingOrigin,
    enumName: 'booking_origin',
    default: BookingOrigin.APP_CLIENT,
  })
  @Field(() => BookingOrigin)
  origin: BookingOrigin;

  /** Reference to the original booking when this is a rescheduled appointment. */
  @Column({ nullable: true })
  rescheduledFromId?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  notes?: string;

  /** Reason provided when the booking is cancelled. */
  @Column({ nullable: true })
  @Field({ nullable: true })
  cancelReason?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.bookings)
  @Field(() => User)
  client: User;

  @ManyToOne(() => Business, business => business.bookings)
  @Field(() => Business)
  business: Business;

  @ManyToOne(() => BusinessService, bs => bs.bookings)
  @Field(() => BusinessService)
  businessService: BusinessService;

  @ManyToOne(() => Employee, employee => employee.bookings, { nullable: true })
  @Field(() => Employee, { nullable: true })
  employee?: Employee;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rescheduledFromId' })
  @Field(() => Booking, { nullable: true })
  rescheduledFrom?: Booking;

  @OneToMany(() => BookingHistory, history => history.booking)
  @Field(() => [BookingHistory], { nullable: true })
  history?: BookingHistory[];
}
