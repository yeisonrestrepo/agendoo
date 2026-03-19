import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, Index } from 'typeorm';
import { Profile } from './profile.entity';
import { OAuthConnection } from './oauth-connection.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum UserRole {
  CLIENT = 'CLIENT',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

@Entity('users')
@Index(['updatedAt'])
@Index(['emailVerificationToken'])
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  @Field(() => UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field()
  emailVerified: boolean;

  /** When false the account is suspended and cannot authenticate. */
  @Column({ default: true })
  @Field()
  active: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  emailVerificationToken?: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  emailVerificationExpiry?: Date | null;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  @Field(() => Profile, { nullable: true })
  profile?: Profile;

  @OneToMany(() => OAuthConnection, connection => connection.user)
  oauthConnections: OAuthConnection[];

  @OneToMany(() => Booking, booking => booking.client)
  bookings: Booking[];
}