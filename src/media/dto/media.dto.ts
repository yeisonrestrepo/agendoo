import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsMimeType, IsOptional, IsString, IsUUID, IsUrl, Min } from 'class-validator';
import { MediaType } from '../entities/media.entity';

@InputType()
export class AddMediaInput {
  @Field(() => MediaType)
  @IsEnum(MediaType)
  type: MediaType;

  @Field()
  @IsUrl()
  url: string;

  @Field()
  @IsString()
  filename: string;

  @Field()
  @IsMimeType()
  mimeType: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  size: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  businessId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  altText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

@InputType()
export class UpdateMediaInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  altText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  caption?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
