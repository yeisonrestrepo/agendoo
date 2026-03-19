import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Booking } from './booking.entity';
import { BookingStatus } from '../enums/booking-status.enum';
import { ActorType } from '../enums/actor-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('booking_history')
@Index(['bookingId'])
@ObjectType()
export class BookingHistory {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  bookingId: string;

  @Column({ type: 'enum', enum: BookingStatus, enumName: 'booking_status' })
  @Field(() => BookingStatus)
  previousStatus: BookingStatus;

  @Column({ type: 'enum', enum: BookingStatus, enumName: 'booking_status' })
  @Field(() => BookingStatus)
  newStatus: BookingStatus;

  @Column()
  changedById: string;

  /** Who initiated this status change. */
  @Column({
    type: 'enum',
    enum: ActorType,
    enumName: 'actor_type',
    default: ActorType.CLIENT,
  })
  @Field(() => ActorType)
  actorType: ActorType;

  @Column({ nullable: true })
  @Field({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @ManyToOne(() => Booking, booking => booking.history, { onDelete: 'CASCADE' })
  booking: Booking;

  @ManyToOne(() => User)
  @Field(() => User)
  changedBy: User;
}
