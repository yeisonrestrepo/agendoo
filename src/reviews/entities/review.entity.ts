import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Professional } from '../../professionals/entities/professional.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('reviews')
@ObjectType()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  clientId: string;

  @Column()
  professionalId: string;

  @Column({ unique: true })
  bookingId: string;

  @Column()
  @Field(() => Int)
  rating: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  comment?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User)
  @Field(() => User)
  client: User;

  @ManyToOne(() => Professional)
  @Field(() => Professional)
  professional: Professional;

  @ManyToOne(() => Booking)
  booking: Booking;
}