import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthProfile } from '../interfaces/oauth-profile.interface';
import { FacebookDebugTokenResponse, FacebookProfileResponse } from '../interfaces/facebook-api.interface';

@Injectable()
export class FacebookOAuthService {
  constructor(private configService: ConfigService) {}

  /**
   * Verifies a Facebook user access token and returns a normalised {@link OAuthProfile}.
   *
   * Token integrity is confirmed via the `debug_token` endpoint using the app's
   * server-side credentials before the user profile is fetched. This prevents
   * tokens issued by other Facebook apps from being accepted.
   *
   * @throws {UnauthorizedException} if the token is invalid, not issued for this app, or the account has no email.
   */
  async verifyToken(token: string): Promise<OAuthProfile> {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    const appToken = `${appId}|${appSecret}`;

    let debugData: FacebookDebugTokenResponse;

    try {
      const response = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(appToken)}`,
      );
      debugData = await response.json() as FacebookDebugTokenResponse;
    } catch {
      throw new UnauthorizedException('Could not validate Facebook token');
    }

    if (!debugData?.data?.is_valid || debugData.data.app_id !== appId) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    let profile: FacebookProfileResponse;

    try {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${encodeURIComponent(token)}&fields=id,name,email,picture`,
      );
      profile = await response.json() as FacebookProfileResponse;
    } catch {
      throw new UnauthorizedException('Could not retrieve Facebook profile');
    }

    if (!profile?.id) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    if (!profile.email) {
      throw new UnauthorizedException(
        'Facebook account does not have a linked email address. Please link an email to your Facebook account.',
      );
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.name,
      photos: profile.picture?.data?.url ? [{ value: profile.picture.data.url }] : [],
    };
  }
}
