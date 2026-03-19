import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

/**
 * Persisted CRM record linking a client to a specific business.
 * Stores business-specific metadata like an internal alias and first/last visit tracking.
 */
@Entity('business_clients')
@Unique(['businessId', 'clientId'])
@ObjectType()
export class BusinessClient {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  businessId: string;

  @Column()
  clientId: string;

  /** Internal alias the business uses for this client (e.g. 'María - color'). */
  @Column({ nullable: true })
  @Field({ nullable: true })
  alias?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  @Field(() => Business)
  business: Business;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  @Field(() => User)
  client: User;
}
