import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString, IsEnum, IsNumber, IsArray, IsUrl, Min } from 'class-validator';
import { EmployeeRole } from '../entities/employee.entity';
import { ServiceCategory } from '../../service-catalog/entities/service-catalog.entity';

@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field(() => EmployeeRole, { nullable: true })
  @IsOptional()
  @IsEnum(EmployeeRole)
  role?: EmployeeRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialties?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [ServiceCategory], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: ServiceCategory[];

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  fotoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  isGeneric?: boolean;
}

@InputType()
export class UpdateEmployeeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialties?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [ServiceCategory], { nullable: true })
  @IsOptional()
  @IsArray()
  categories?: ServiceCategory[];

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  fotoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  active?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  isGeneric?: boolean;
}

@InputType()
export class AssignEmployeeServiceInput {
  @Field()
  @IsUUID()
  businessServiceId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  customDuration?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  skill?: string;
}
