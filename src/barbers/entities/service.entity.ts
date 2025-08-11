import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Barber } from './barber.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('services')
@ObjectType()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  barberId: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field(() => Float)
  price: number;

  @Column()
  @Field(() => Int)
  duration: number; // minutos

  @Column({ default: true })
  @Field()
  active: boolean;

  @ManyToOne(() => Barber, barber => barber.services)
  barber: Barber;

  @OneToMany(() => Booking, booking => booking.service)
  bookings: Booking[];
}