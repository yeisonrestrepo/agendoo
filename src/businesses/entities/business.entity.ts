import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BusinessService } from './business-service.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { BusinessAmenity } from '../../amenities/entities/business-amenity.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum BusinessType {
  BARBER = 'BARBER',
  NAIL_ARTIST = 'NAIL_ARTIST',
  MAKEUP_ARTIST = 'MAKEUP_ARTIST',
  HAIR_STYLIST = 'HAIR_STYLIST',
  BEAUTY_SALON = 'BEAUTY_SALON',
  BARBERSHOP = 'BARBERSHOP',
  NAIL_SALON = 'NAIL_SALON',
  SPA = 'SPA',
  LASH_ARTIST = 'LASH_ARTIST',
  BROW_ARTIST = 'BROW_ARTIST',
  SKINCARE_SPECIALIST = 'SKINCARE_SPECIALIST',
  MASSAGE_THERAPIST = 'MASSAGE_THERAPIST',
}

export enum BusinessSize {
  INDIVIDUAL = 'INDIVIDUAL',
  SMALL_BUSINESS = 'SMALL_BUSINESS',
  MEDIUM_BUSINESS = 'MEDIUM_BUSINESS',
  LARGE_BUSINESS = 'LARGE_BUSINESS',
}

export enum ServiceModality {
  /** Client travels to the business location. */
  PHYSICAL = 'PHYSICAL',
  /** Professional travels to the client's location. */
  HOME_SERVICE = 'HOME_SERVICE',
  /** Both physical and home-service modalities are offered. */
  BOTH = 'BOTH',
}

registerEnumType(BusinessType, { name: 'BusinessType' });
registerEnumType(BusinessSize, { name: 'BusinessSize' });
registerEnumType(ServiceModality, { name: 'ServiceModality' });

@Entity('businesses')
@Index(['lat', 'lng'])
@Index(['city'])
@ObjectType()
export class Business {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  ownerId: string;

  @Column()
  @Field()
  businessName: string;

  @Column({
    type: 'enum',
    enum: BusinessType,
  })
  @Field(() => BusinessType)
  type: BusinessType;

  @Column({
    type: 'enum',
    enum: BusinessSize,
    default: BusinessSize.INDIVIDUAL,
  })
  @Field(() => BusinessSize)
  businessSize: BusinessSize;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  specialties?: string;

  @Column({ default: false })
  @Field()
  verified: boolean;

  /** When false the business is unlisted and cannot receive new bookings. */
  @Column({ default: true })
  @Field()
  active: boolean;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  @Field(() => Float)
  averageRating: number;

  @Column({ default: 0 })
  @Field()
  totalReviews: number;

  @Column({ default: 24 })
  @Field()
  cancellationHours: number;

  @Column({ default: false })
  @Field()
  instantBooking: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  facebook?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  city?: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  @Field(() => Float, { nullable: true })
  lat?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  @Field(() => Float, { nullable: true })
  lng?: number;

  @Column({ type: 'enum', enum: ServiceModality, default: ServiceModality.PHYSICAL })
  @Field(() => ServiceModality)
  serviceModality: ServiceModality;

  /** Coverage radius in kilometres for home-service businesses. */
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  serviceRadius?: number;

  /** Latitude of the home-service coverage centre point. */
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  @Field(() => Float, { nullable: true })
  serviceAreaLat?: number;

  /** Longitude of the home-service coverage centre point. */
  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  @Field(() => Float, { nullable: true })
  serviceAreaLng?: number;

  /**
   * When true, this business is operated by a single professional who is also
   * the owner. The owner is automatically registered as an employee so that
   * availability and booking logic works uniformly.
   */
  @Column({ default: false })
  @Field()
  isSingleMember: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  @Field(() => User)
  owner: User;

  @OneToMany(() => Employee, employee => employee.business, { cascade: true })
  @Field(() => [Employee])
  employees: Employee[];

  @OneToMany(() => BusinessService, bs => bs.business, { cascade: true })
  @Field(() => [BusinessService])
  businessServices: BusinessService[];

  @OneToMany(() => Booking, booking => booking.business)
  bookings: Booking[];

  @OneToMany(() => BusinessAmenity, ba => ba.business)
  businessAmenities: BusinessAmenity[];

  @OneToMany(() => Review, review => review.business)
  @Field(() => [Review])
  reviews: Review[];
}
