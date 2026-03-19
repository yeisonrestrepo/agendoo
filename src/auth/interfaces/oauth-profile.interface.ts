/** Normalised OAuth profile returned by every provider service (Google, Facebook, …). */
export interface OAuthProfile {
  /** Provider-scoped unique user identifier. */
  id: string;
  /** Verified email address returned by the provider. */
  email: string;
  /** Full display name, if the provider returns one. */
  displayName?: string;
  /** Public avatar URL objects, if the provider returns any. */
  photos: Array<{ value: string }>;
}
