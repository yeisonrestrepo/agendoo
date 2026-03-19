import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { Gender } from '../enums/gender.enum';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  lng?: number;
}

@InputType()
export class AddFavoriteInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;
}

@InputType()
export class SaveSearchInput {
  @Field()
  @IsString()
  name: string;

  @Field({ description: 'JSON-encoded search filters snapshot.' })
  @IsString()
  filters: string;
}

@InputType()
export class UpdatePreferencesInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifyBookingConfirmed?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifyBookingReminder?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifyBookingCancelled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifyPromotions?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  profileVisibleToBookedBusinesses?: boolean;
}