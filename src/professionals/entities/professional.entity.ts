import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from './service.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { ProfessionalAmenity } from '../../amenities/entities/professional-amenity.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Media } from '../../media/entities/media.entity';

export enum ProfessionalType {
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
  INDIVIDUAL = 'INDIVIDUAL',           // Profesional independiente
  SMALL_BUSINESS = 'SMALL_BUSINESS',   // 2-5 profesionales
  MEDIUM_BUSINESS = 'MEDIUM_BUSINESS', // 6-15 profesionales
  LARGE_BUSINESS = 'LARGE_BUSINESS',   // 16+ profesionales
}

registerEnumType(ProfessionalType, { name: 'ProfessionalType' });
registerEnumType(BusinessSize, { name: 'BusinessSize' });

@Entity('professionals')
@ObjectType()
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  userId: string;

  @Column()
  @Field()
  businessName: string;

  @Column({
    type: 'enum',
    enum: ProfessionalType,
  })
  @Field(() => ProfessionalType)
  type: ProfessionalType;

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

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  workingHours?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  instagram?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  facebook?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @OneToOne(() => User)
  @JoinColumn()
  @Field(() => User)
  user: User;

  @OneToMany(() => Service, service => service.professional, { cascade: true })
  @Field(() => [Service])
  services: Service[];

  @OneToMany(() => Booking, booking => booking.professional)
  bookings: Booking[];

  @OneToMany(() => ProfessionalAmenity, pa => pa.professional)
  professionalAmenities: ProfessionalAmenity[];

  @OneToMany(() => Review, review => review.professional)
  @Field(() => [Review])
  reviews: Review[];

  @OneToMany(() => Media, media => media.owner)
  @Field(() => [Media])
  media: Media[];
}