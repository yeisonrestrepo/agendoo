import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Business } from './business.entity';
import { ServiceCatalog, ServiceCategory } from '../../service-catalog/entities/service-catalog.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { EmployeeService } from '../../employees/entities/employee-service.entity';

@Entity('business_services')
@Index(['businessId', 'active'])
@ObjectType()
export class BusinessService {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  businessId: string;

  @Column()
  catalogServiceId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  customName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  customDescription?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field(() => Float)
  price: number;

  /** Original price before discount, used to display a strikethrough price. */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  originalPrice?: number;

  /** Display order within the business service list. Lower values appear first. */
  @Column({ default: 0 })
  @Field(() => Int)
  sortOrder: number;

  @Column()
  @Field(() => Int)
  duration: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Buffer/prep time before service in minutes' })
  bufferBefore: number;

  @Column({ default: 0 })
  @Field(() => Int, { description: 'Cleaning/buffer time after service in minutes' })
  bufferAfter: number;

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

  /**
   * Override the catalog categories for this business service.
   * When set, these categories are used instead of the catalog service's category for filtering.
   */
  @Column('simple-array', { nullable: true })
  @Field(() => [ServiceCategory], { nullable: true })
  categoriesOverride?: ServiceCategory[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => Business, business => business.businessServices)
  business: Business;

  @ManyToOne(() => ServiceCatalog, { eager: true })
  @Field(() => ServiceCatalog)
  catalogService: ServiceCatalog;

  @OneToMany(() => EmployeeService, es => es.businessService)
  @Field(() => [EmployeeService], { nullable: true })
  employeeServices?: EmployeeService[];

  @OneToMany(() => Booking, booking => booking.businessService)
  bookings: Booking[];
}
