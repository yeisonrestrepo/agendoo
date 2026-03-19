import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';
import { Employee } from '../../employees/entities/employee.entity';

export enum ExceptionType {
  HOLIDAY = 'HOLIDAY',
  BREAK = 'BREAK',
  CUSTOM = 'CUSTOM',
}

registerEnumType(ExceptionType, { name: 'ExceptionType' });

@Entity('schedule_exceptions')
@ObjectType()
export class ScheduleException {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column({ nullable: true })
  businessId?: string;

  @Column({ nullable: true })
  employeeId?: string;

  /** ISO date string (`YYYY-MM-DD`). */
  @Column({ type: 'date' })
  @Field()
  date: string;

  @Column({
    type: 'enum',
    enum: ExceptionType,
  })
  @Field(() => ExceptionType)
  type: ExceptionType;

  /** Start time of the blocked window (`HH:mm`). When absent, the entire day is blocked. */
  @Column({ type: 'time', nullable: true })
  @Field({ nullable: true })
  startTime?: string;

  @Column({ type: 'time', nullable: true })
  @Field({ nullable: true })
  endTime?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @ManyToOne(() => Business, { nullable: true, onDelete: 'CASCADE' })
  business?: Business;

  @ManyToOne(() => Employee, { nullable: true, onDelete: 'CASCADE' })
  employee?: Employee;
}
