import { registerEnumType } from '@nestjs/graphql';

export enum BookingOrigin {
  /** Booking created by the client through the app. */
  APP_CLIENT = 'APP_CLIENT',
  /** Booking created manually by the business on behalf of a client. */
  MANUAL = 'MANUAL',
}

registerEnumType(BookingOrigin, { name: 'BookingOrigin' });
