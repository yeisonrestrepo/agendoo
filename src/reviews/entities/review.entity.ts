import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('reviews')
@Index(['businessId'])
@Index(['clientId'])
@ObjectType()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  clientId: string;

  @Column()
  businessId: string;

  @Column({ unique: true })
  bookingId: string;

  @Column()
  @Field(() => Int)
  rating: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  comment?: string;

  /** True when the review is linked to a finalized booking (always true for app-created reviews). */
  @Column({ default: false })
  @Field()
  verified: boolean;

  /** True when the review has been flagged for moderation. */
  @Column({ default: false })
  @Field()
  flagged: boolean;

  /** Reason provided when the review was flagged. */
  @Column({ nullable: true })
  @Field({ nullable: true })
  flagReason?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  client: User;

  @ManyToOne(() => Business)
  @Field(() => Business)
  business: Business;

  @ManyToOne(() => Booking)
  booking: Booking;
}
