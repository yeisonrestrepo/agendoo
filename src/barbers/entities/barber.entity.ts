import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from './service.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('barbers')
@ObjectType()
export class Barber {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  userId: string;

  @Column()
  @Field()
  businessName: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ default: false })
  @Field()
  verified: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  @Field(() => User)
  user: User;

  @OneToMany(() => Service, service => service.barber, { cascade: true })
  @Field(() => [Service])
  services: Service[];

  @OneToMany(() => Booking, booking => booking.barber)
  bookings: Booking[];
}