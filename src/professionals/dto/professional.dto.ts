import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsArray, IsNumber, Min, Max, IsEnum, IsString } from 'class-validator';
import { ProfessionalType } from '../entities/professional.entity';
import { ServiceCategory } from '../entities/service.entity';

@InputType()
export class CreateServiceInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ServiceCategory)
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  duration: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  requirements?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

@InputType()
export class ProfessionalFiltersInput {
  @Field(() => [ProfessionalType], { nullable: true })
  @IsOptional()
  @IsArray()
  types?: ProfessionalType[];

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