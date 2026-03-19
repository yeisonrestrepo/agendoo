import { InputType, ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { IsUUID, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@InputType()
export class CreateClientNoteInput {
  @Field()
  @IsUUID()
  clientId: string;

  @Field()
  @IsString()
  content: string;
}

@InputType()
export class UpdateClientNoteInput {
  @Field()
  @IsString()
  content: string;
}

@InputType()
export class CreateCancellationPolicyInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  hoursBeforeBooking: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  penaltyPercentage: number;
}

@InputType()
export class UpdateCancellationPolicyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hoursBeforeBooking?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  penaltyPercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  active?: boolean;
}

@InputType()
export class CreateManualBookingInput {
  @Field()
  @IsUUID()
  clientId: string;

  @Field()
  @IsUUID()
  businessServiceId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field()
  @IsString()
  dateTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@ObjectType()
export class ClientVisitSummary {
  /**
   * Always resolved by `@ResolveField` in `ClientVisitSummaryResolver`.
   * The service sets `clientId` and the resolver loads the full entity via DataLoader.
   */
  @Field(() => User)
  client!: User;

  /** Internal identifier used by the resolver to hydrate {@link client} via DataLoader. Not a GraphQL field. */
  clientId?: string;

  @Field(() => Int)
  totalVisits: number;

  @Field(() => Float)
  totalSpent: number;

  @Field({ nullable: true })
  lastVisitDate?: Date;

  @Field({ nullable: true })
  firstVisitDate?: Date;
}
