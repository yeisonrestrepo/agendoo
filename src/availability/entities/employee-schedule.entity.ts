import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';
import { BreakBlock } from '../dto/break-block.dto';

@Entity('employee_schedules')
@Unique(['employeeId', 'dayOfWeek'])
@ObjectType()
export class EmployeeSchedule {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  employeeId: string;

  /** Day index where 0 = Monday and 6 = Sunday. */
  @Column()
  @Field(() => Int)
  dayOfWeek: number;

  /** Shift start time in `HH:mm` format. */
  @Column({ type: 'time' })
  @Field()
  startTime: string;

  /** Shift end time in `HH:mm` format. */
  @Column({ type: 'time' })
  @Field()
  endTime: string;

  @Column({ default: true })
  @Field()
  isWorking: boolean;

  /**
   * Optional break periods within this shift (e.g., lunch).
   * Each block defines a start and end time in `HH:mm` format during which
   * the employee is unavailable for new bookings.
   */
  @Column({ type: 'jsonb', nullable: true, default: [] })
  @Field(() => [BreakBlock], { nullable: true })
  breaks?: BreakBlock[];

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  employee: Employee;
}
