import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../users/entities/user.entity';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(6)
  password: string;

  @Field()
  @IsString()
  name: string;

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}

@InputType()
export class OAuthLoginInput {
  @Field()
  @IsString()
  token: string;

  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  userType?: UserRole;
}