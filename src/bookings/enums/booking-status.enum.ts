import { registerEnumType } from '@nestjs/graphql';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINALIZED = 'FINALIZED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(BookingStatus, { name: 'BookingStatus' });
