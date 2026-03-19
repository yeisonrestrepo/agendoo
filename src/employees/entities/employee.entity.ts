import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { EmployeeService } from './employee-service.entity';
import { ServiceCategory } from '../../service-catalog/entities/service-catalog.entity';

export enum EmployeeRole {
  OWNER = 'OWNER',
  COLLABORATOR = 'COLLABORATOR',
}

registerEnumType(EmployeeRole, { name: 'EmployeeRole' });

@Entity('employees')
@Index(['businessId', 'active'])
@Index(['userId'])
@ObjectType()
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  userId: string;

  @Column()
  businessId: string;

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.COLLABORATOR,
  })
  @Field(() => EmployeeRole)
  role: EmployeeRole;

  @Column({ nullable: true })
  @Field({ nullable: true })
  specialties?: string;

  /** Skill tags used for search and display (e.g. 'balayage', 'keratin', 'beard fade'). */
  @Column('simple-array', { nullable: true })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  /** Service categories this employee works with. Used for filtering in the client app. */
  @Column('simple-array', { nullable: true })
  @Field(() => [ServiceCategory], { nullable: true })
  categories?: ServiceCategory[];

  /** Employee-specific profile photo URL. Overrides the user profile avatar in business context. */
  @Column({ nullable: true })
  @Field({ nullable: true })
  fotoUrl?: string;

  /**
   * When true, this record represents the virtual "Any professional" option.
   * The availability engine aggregates free slots across all real employees
   * who can perform the requested service and assigns one automatically at
   * booking time.
   */
  @Column({ default: false })
  @Field()
  isGeneric: boolean;

  @Column({ default: true })
  @Field()
  active: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn()
  @Field(() => User)
  user: User;

  @ManyToOne(() => Business, business => business.employees)
  @Field(() => Business)
  business: Business;

  @OneToMany(() => Booking, booking => booking.employee)
  bookings: Booking[];

  @OneToMany(() => EmployeeService, es => es.employee)
  @Field(() => [EmployeeService], { nullable: true })
  employeeServices?: EmployeeService[];
}
