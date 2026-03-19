import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique, Check } from 'typeorm';
import { User } from './user.entity';

/**
 * Represents a client's saved favourite — either a business or an employee.
 * Exactly one of `businessId` or `employeeId` must be set.
 */
@Entity('favorites')
@Unique(['userId', 'businessId'])
@Unique(['userId', 'employeeId'])
@ObjectType()
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  businessId?: string;

  @Column({ type: 'uuid', nullable: true })
  employeeId?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
