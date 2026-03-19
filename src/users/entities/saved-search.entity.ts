import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

/**
 * A named set of search filters saved by a client for quick reuse.
 * Filters are stored as a JSON blob so they can evolve without schema changes.
 */
@Entity('saved_searches')
@ObjectType()
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  userId: string;

  @Column()
  @Field()
  name: string;

  /** JSON-encoded `BusinessFiltersInput` snapshot. */
  @Column({ type: 'jsonb' })
  @Field({ description: 'JSON-encoded search filters snapshot.' })
  filters: string;

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
