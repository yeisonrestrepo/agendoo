import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Employee } from './employee.entity';
import { BusinessService } from '../../businesses/entities/business-service.entity';

@Entity('employee_services')
@Index(['businessServiceId', 'active'])
@Index(['employeeId', 'active'])
@ObjectType()
export class EmployeeService {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  employeeId: string;

  @Column()
  businessServiceId: string;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  customDuration?: number;

  /** Optional price override for this employee. Overrides the business service price. */
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  @Field(() => Float, { nullable: true })
  customPrice?: number;

  /** Skill or proficiency level for this service (e.g. 'junior', 'senior', 'master'). */
  @Column({ nullable: true })
  @Field({ nullable: true })
  skill?: string;

  @Column({ default: true })
  @Field()
  active: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => Employee, employee => employee.employeeServices)
  @Field(() => Employee)
  employee: Employee;

  @ManyToOne(() => BusinessService, bs => bs.employeeServices)
  @Field(() => BusinessService)
  businessService: BusinessService;
}
