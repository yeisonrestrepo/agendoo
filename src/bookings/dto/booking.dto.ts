import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsDateString, IsOptional, IsString, IsEnum } from 'class-validator';
import { BookingOrigin } from '../enums/booking-origin.enum';

@InputType()
export class CreateBookingInput {
  @Field()
  @IsUUID()
  businessId: string;

  @Field()
  @IsUUID()
  businessServiceId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field()
  @IsDateString()
  dateTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => BookingOrigin, { nullable: true })
  @IsOptional()
  @IsEnum(BookingOrigin)
  origin?: BookingOrigin;

  /** ID of the booking being rescheduled, when this is a replacement appointment. */
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  rescheduledFromId?: string;
}
