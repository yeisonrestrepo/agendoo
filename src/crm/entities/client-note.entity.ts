import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('client_notes')
@Index(['businessId', 'clientId'])
@ObjectType()
export class ClientNote {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  businessId: string;

  @Column()
  clientId: string;

  @Column()
  createdById: string;

  @Column('text')
  @Field()
  content: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => Business)
  @Field(() => Business)
  business: Business;

  @ManyToOne(() => User)
  @Field(() => User)
  client: User;

  @ManyToOne(() => User)
  @Field(() => User)
  createdBy: User;
}
