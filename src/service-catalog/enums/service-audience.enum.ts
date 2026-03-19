import { registerEnumType } from '@nestjs/graphql';

export enum ServiceAudience {
  ALL = 'ALL',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  KIDS = 'KIDS',
}

registerEnumType(ServiceAudience, { name: 'ServiceAudience' });
