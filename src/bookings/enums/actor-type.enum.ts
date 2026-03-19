import { registerEnumType } from '@nestjs/graphql';

/** Who triggered a booking status change. */
export enum ActorType {
  /** Automated system action (e.g. scheduled job, webhook). */
  SYSTEM = 'SYSTEM',
  /** The client who owns the booking. */
  CLIENT = 'CLIENT',
  /** An employee of the business. */
  EMPLOYEE = 'EMPLOYEE',
  /** The business owner or admin acting on behalf of the business. */
  BUSINESS = 'BUSINESS',
}

registerEnumType(ActorType, { name: 'ActorType' });
