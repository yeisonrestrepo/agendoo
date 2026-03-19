import { UserRole } from '../../users/entities/user.entity';

/** Decoded payload stored in every JWT issued by this API. */
export interface JwtPayload {
  /** User's UUID. Maps to the `sub` (subject) JWT claim. */
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
