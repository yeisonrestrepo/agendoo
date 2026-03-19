import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';
import { BreakBlock } from '../dto/break-block.dto';

@Entity('business_hours')
@Unique(['businessId', 'dayOfWeek'])
@ObjectType()
export class BusinessHours {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  businessId: string;

  /** Day index where 0 = Monday and 6 = Sunday. */
  @Column()
  @Field(() => Int)
  dayOfWeek: number;

  /** Opening time in `HH:mm` format. */
  @Column({ type: 'time' })
  @Field()
  openTime: string;

  /** Closing time in `HH:mm` format. */
  @Column({ type: 'time' })
  @Field()
  closeTime: string;

  @Column({ default: true })
  @Field()
  isOpen: boolean;

  /**
   * Optional break periods within this day's working hours (e.g., lunch).
   * Each block defines a start and end time in `HH:mm` format during which
   * the business is unavailable for new bookings.
   */
  @Column({ type: 'jsonb', nullable: true, default: [] })
  @Field(() => [BreakBlock], { nullable: true })
  breaks?: BreakBlock[];

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business: Business;
}
