import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';

@Entity('cancellation_policies')
@ObjectType()
export class CancellationPolicy {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  businessId: string;

  @Column()
  @Field()
  name: string;

  @Column('text', { nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column()
  @Field(() => Int, { description: 'Minimum hours before booking to cancel without penalty' })
  hoursBeforeBooking: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  @Field(() => Float, { description: 'Penalty percentage (0-100) if cancelled within the window' })
  penaltyPercentage: number;

  @Column({ default: true })
  @Field()
  active: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => Business)
  business: Business;
}
