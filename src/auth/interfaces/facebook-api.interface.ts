/** Response from the Facebook `debug_token` Graph API endpoint. */
export interface FacebookDebugTokenResponse {
  data: {
    app_id: string;
    is_valid: boolean;
    user_id?: string;
    error?: { message: string };
  };
}

/** Response from the Facebook `me` Graph API endpoint. */
export interface FacebookProfileResponse {
  id: string;
  name?: string;
  email?: string;
  picture?: {
    data: { url: string };
  };
  error?: { message: string };
}
