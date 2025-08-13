import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Professional } from 'src/professionals/entities/professional.entity';
import { Service } from 'src/professionals/entities/service.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

registerEnumType(BookingStatus, {
  name: 'BookingStatus',
});

@Entity('bookings')
@ObjectType()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  clientId: string;

  @Column()
  professionalId: string;

  @Column()
  serviceId: string;

  @Column()
  @Field()
  dateTime: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @Field(() => BookingStatus)
  status: BookingStatus;

  @Column({ nullable: true })
  @Field({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.bookings)
  @Field(() => User)
  client: User;

  @ManyToOne(() => Professional, professional => professional.bookings)
  @Field(() => Professional)
  professional: Professional;

  @ManyToOne(() => Service, service => service.bookings)
  @Field(() => Service)
  service: Service;
}