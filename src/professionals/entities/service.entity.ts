import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Professional } from './professional.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum ServiceCategory {
  HAIRCUT = 'HAIRCUT',
  HAIR_COLOR = 'HAIR_COLOR',
  HAIR_STYLING = 'HAIR_STYLING',
  HAIR_TREATMENT = 'HAIR_TREATMENT',
  
  BEARD_TRIM = 'BEARD_TRIM',
  SHAVE = 'SHAVE',
  MUSTACHE = 'MUSTACHE',
  
  MANICURE = 'MANICURE',
  PEDICURE = 'PEDICURE',
  NAIL_ART = 'NAIL_ART',
  NAIL_EXTENSIONS = 'NAIL_EXTENSIONS',
  
  EVERYDAY_MAKEUP = 'EVERYDAY_MAKEUP',
  SPECIAL_EVENT_MAKEUP = 'SPECIAL_EVENT_MAKEUP',
  BRIDAL_MAKEUP = 'BRIDAL_MAKEUP',
  
  EYEBROW_SHAPING = 'EYEBROW_SHAPING',
  EYELASH_EXTENSIONS = 'EYELASH_EXTENSIONS',
  EYELASH_LIFT = 'EYELASH_LIFT',
  
  FACIAL = 'FACIAL',
  FACIAL_TREATMENT = 'FACIAL_TREATMENT',
  SKIN_CONSULTATION = 'SKIN_CONSULTATION',
  
  RELAXING_MASSAGE = 'RELAXING_MASSAGE',
  THERAPEUTIC_MASSAGE = 'THERAPEUTIC_MASSAGE',
  
  CONSULTATION = 'CONSULTATION',
  PACKAGE_DEAL = 'PACKAGE_DEAL',
}

registerEnumType(ServiceCategory, { name: 'ServiceCategory' });

@Entity('services')
@ObjectType()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  professionalId: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ServiceCategory,
  })
  @Field(() => ServiceCategory)
  category: ServiceCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field(() => Float)
  price: number;

  @Column()
  @Field(() => Int)
  duration: number;

  @Column({ default: true })
  @Field()
  active: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  requirements?: string;

  @Column({ default: false })
  @Field()
  isPopular: boolean;

  @Column('simple-array', { nullable: true })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  @ManyToOne(() => Professional, professional => professional.services)
  professional: Professional;

  @OneToMany(() => Booking, booking => booking.service)
  bookings: Booking[];
}