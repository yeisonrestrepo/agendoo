import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsArray, IsNumber, Min, Max, IsString, IsUUID, IsEnum, IsUrl, IsBoolean } from 'class-validator';
import { BusinessType, BusinessSize, ServiceModality } from '../entities/business.entity';
import { ServiceCategory } from '../../service-catalog/entities/service-catalog.entity';

@InputType()
export class CreateBusinessInput {
  @Field()
  @IsString()
  businessName: string;

  @Field(() => BusinessType)
  @IsEnum(BusinessType)
  type: BusinessType;

  @Field(() => BusinessSize, { nullable: true })
  @IsOptional()
  @IsEnum(BusinessSize)
  businessSize?: BusinessSize;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialties?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @Field(() => ServiceModality, { nullable: true })
  @IsOptional()
  @IsEnum(ServiceModality)
  serviceModality?: ServiceModality;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  serviceRadius?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  serviceAreaLat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  serviceAreaLng?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instagram?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  facebook?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  instantBooking?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cancellationHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSingleMember?: boolean;
}

@InputType()
export class UpdateBusinessInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessName?: string;

  @Field(() => BusinessType, { nullable: true })
  @IsOptional()
  @IsEnum(BusinessType)
  type?: BusinessType;

  @Field(() => BusinessSize, { nullable: true })
  @IsOptional()
  @IsEnum(BusinessSize)
  businessSize?: BusinessSize;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialties?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @Field(() => ServiceModality, { nullable: true })
  @IsOptional()
  @IsEnum(ServiceModality)
  serviceModality?: ServiceModality;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  serviceRadius?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  serviceAreaLat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  serviceAreaLng?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instagram?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  facebook?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  instantBooking?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cancellationHours?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isSingleMember?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

@InputType()
export class CreateBusinessServiceInput {
  @Field()
  @IsUUID()
  catalogServiceId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customDescription?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  duration: number;

  @Field(() => Int, { nullable: true, description: 'Buffer/prep time before service in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferBefore?: number;

  @Field(() => Int, { nullable: true, description: 'Cleaning/buffer time after service in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bufferAfter?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [ServiceCategory], { nullable: true })
  @IsOptional()
  @IsArray()
  categoriesOverride?: ServiceCategory[];
}

@InputType()
export class BusinessFiltersInput {
  @Field(() => [BusinessType], { nullable: true })
  @IsOptional()
  @IsArray()
  types?: BusinessType[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => ServiceModality, { nullable: true })
  @IsOptional()
  serviceModality?: ServiceModality;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  radius?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field(() => [ServiceCategory], { nullable: true })
  @IsOptional()
  @IsArray()
  serviceCategories?: ServiceCategory[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  amenityIds?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @Field({ nullable: true })
  @IsOptional()
  verifiedOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  instantBookingOnly?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  offset?: number;
}
