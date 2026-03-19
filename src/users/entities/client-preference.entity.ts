import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

/** Per-client notification and privacy preferences. One record per user. */
@Entity('client_preferences')
@ObjectType()
export class ClientPreference {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: true })
  @Field()
  notifyBookingConfirmed: boolean;

  @Column({ default: true })
  @Field()
  notifyBookingReminder: boolean;

  @Column({ default: true })
  @Field()
  notifyBookingCancelled: boolean;

  @Column({ default: true })
  @Field()
  notifyPromotions: boolean;

  /** When true, the client's profile (name, photo) is visible to businesses they have booked. */
  @Column({ default: true })
  @Field()
  profileVisibleToBookedBusinesses: boolean;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
