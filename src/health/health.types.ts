import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HealthResponse {
  @Field()
  status: string;

  @Field()
  message: string;

  @Field()
  timestamp: string;

  @Field()
  version: string;

  @Field({ nullable: true })
  environment?: string;

  @Field({ nullable: true })
  uptime?: string;
}

@ObjectType()
export class VersionResponse {
  @Field()
  version: string;

  @Field()
  name: string;

  @Field()
  environment: string;

  @Field()
  nodeVersion: string;

  @Field()
  buildTime: string;
}

@ObjectType()
export class DatabaseHealthResponse {
  @Field()
  status: string;

  @Field()
  connected: boolean;

  @Field({ nullable: true })
  host?: string;

  @Field({ nullable: true })
  database?: string;

  @Field({ nullable: true })
  responseTime?: number;
}