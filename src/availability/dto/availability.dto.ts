import { InputType, ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsNumber, Min, Max, IsEnum, IsDateString, Matches, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExceptionType } from '../entities/schedule-exception.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { BreakBlockInput } from './break-block.dto';

@InputType()
export class GetAvailableSlotsInput {
  @Field()
  @IsUUID()
  businessId: string;

  @Field()
  @IsUUID()
  businessServiceId: string;

  /** ISO date string (`YYYY-MM-DD`). */
  @Field()
  @IsDateString()
  date: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}

@InputType()
export class SetBusinessHoursInput {
  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Field()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  openTime: string;

  @Field()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  closeTime: string;

  @Field({ nullable: true })
  @IsOptional()
  isOpen?: boolean;

  @Field(() => [BreakBlockInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakBlockInput)
  breaks?: BreakBlockInput[];
}

@InputType()
export class SetEmployeeScheduleInput {
  @Field()
  @IsUUID()
  employeeId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Field()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @Field()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @Field({ nullable: true })
  @IsOptional()
  isWorking?: boolean;

  @Field(() => [BreakBlockInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakBlockInput)
  breaks?: BreakBlockInput[];
}

@InputType()
export class CreateScheduleExceptionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field()
  @IsDateString()
  date: string;

  @Field(() => ExceptionType)
  @IsEnum(ExceptionType)
  type: ExceptionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@ObjectType()
export class TimeSlot {
  /** ISO datetime string (`YYYY-MM-DDTHH:mm:ss`). */
  @Field()
  startTime: string;

  /** ISO datetime string (`YYYY-MM-DDTHH:mm:ss`). */
  @Field()
  endTime: string;

  @Field(() => ID, { nullable: true })
  employeeId?: string;

  @Field(() => Employee, { nullable: true })
  employee?: Employee;
}
