import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ServiceCategory } from '../entities/service-catalog.entity';
import { ServiceAudience } from '../enums/service-audience.enum';

@InputType()
export class CreateServiceCatalogInput {
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

  @Field(() => ServiceAudience, { nullable: true })
  @IsOptional()
  @IsEnum(ServiceAudience)
  audience?: ServiceAudience;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  defaultDuration: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
}

@InputType()
export class UpdateServiceCatalogInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ServiceAudience, { nullable: true })
  @IsOptional()
  @IsEnum(ServiceAudience)
  audience?: ServiceAudience;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  defaultDuration?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  active?: boolean;
}
