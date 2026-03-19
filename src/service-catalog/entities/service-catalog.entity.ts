import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ServiceAudience } from '../enums/service-audience.enum';

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

export { ServiceAudience };

@Entity('service_catalog')
@ObjectType()
export class ServiceCatalog {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

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

  /** Intended audience for this service. Used for filtering in the client app. */
  @Column({
    type: 'enum',
    enum: ServiceAudience,
    default: ServiceAudience.ALL,
  })
  @Field(() => ServiceAudience)
  audience: ServiceAudience;

  @Column()
  @Field(() => Int)
  defaultDuration: number;

  /**
   * Suggested base price for this service. Individual businesses may override
   * this in their `BusinessService` record.
   */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  basePrice?: number;

  /**
   * Suggested original price before any discount. Used alongside `basePrice`
   * to display a strikethrough reference price.
   */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  originalPrice?: number;

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
