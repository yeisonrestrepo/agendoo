import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBookingInput {
  @Field()
  @IsUUID()
  barberId: string;

  @Field()
  @IsUUID()
  serviceId: string;

  @Field()
  @IsDateString()
  dateTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}