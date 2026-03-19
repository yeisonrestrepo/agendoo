import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

@InputType()
export class CreateAmenityInput {
  @Field()
  @IsString()
  @MinLength(2)
  name: string;

  @Field()
  @IsString()
  icon: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdateAmenityInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  active?: boolean;
}

@InputType()
export class AddAmenityToBusinessInput {
  @Field()
  @IsUUID()
  amenityId: string;
}
