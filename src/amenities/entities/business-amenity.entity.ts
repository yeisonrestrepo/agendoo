import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';
import { Amenity } from './amenity.entity';

@Entity('business_amenities')
@Index(['businessId'])
@ObjectType()
export class BusinessAmenity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  businessId: string;

  @Column()
  @Field()
  amenityId: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ManyToOne(() => Amenity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'amenityId' })
  @Field(() => Amenity)
  amenity: Amenity;
}
