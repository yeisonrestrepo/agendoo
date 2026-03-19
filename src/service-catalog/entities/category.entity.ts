import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Persisted category for grouping services (e.g. hair-styling, barbershop, nails).
 * Unlike the `ServiceCategory` enum, this entity is admin-configurable without redeployment.
 */
@Entity('categories')
@ObjectType()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  /** URL-safe identifier used by clients (e.g. 'hair-styling'). Unique. */
  @Column({ unique: true })
  @Field()
  slug: string;

  @Column()
  @Field()
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;

  /** Determines display order in listings. Lower values appear first. */
  @Column({ default: 0 })
  @Field(() => Int)
  sortOrder: number;

  @Column({ default: true })
  @Field()
  active: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
