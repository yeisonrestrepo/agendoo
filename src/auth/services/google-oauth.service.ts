import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { OAuthProfile } from '../interfaces/oauth-profile.interface';

@Injectable()
export class GoogleOAuthService {
  private oauth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.oauth2Client = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  /**
   * Verifies a Google ID token and returns a normalised {@link OAuthProfile}.
   * @throws {UnauthorizedException} if the token is invalid, missing required fields, or the email is unverified.
   */
  async verifyToken(token: string): Promise<OAuthProfile> {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload.email) {
      throw new UnauthorizedException('Google account does not have a linked email address');
    }

    if (!payload.email_verified) {
      throw new UnauthorizedException('Google account email is not verified');
    }

    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.name,
      photos: payload.picture ? [{ value: payload.picture }] : [],
    };
  }
}
