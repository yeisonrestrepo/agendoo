import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

registerEnumType(DevicePlatform, { name: 'DevicePlatform' });

/**
 * Stores push notification tokens per user device.
 * One user can have multiple active devices.
 */
@Entity('devices')
@Index(['userId'])
@Index(['pushToken'], { unique: true })
@ObjectType()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  userId: string;

  /** FCM (Android/Web) or APNs (iOS) push token. Must be unique across devices. */
  @Column({ unique: true })
  @Field()
  pushToken: string;

  @Column({ type: 'enum', enum: DevicePlatform })
  @Field(() => DevicePlatform)
  platform: DevicePlatform;

  /** Human-readable device name for debugging (e.g. 'iPhone 15 Pro'). */
  @Column({ nullable: true })
  @Field({ nullable: true })
  deviceName?: string;

  @Column({ default: true })
  @Field()
  active: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
