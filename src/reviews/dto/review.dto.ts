import { InputType, Field, Int } from '@nestjs/graphql';
import { IsUUID, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field()
  @IsUUID()
  bookingId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}