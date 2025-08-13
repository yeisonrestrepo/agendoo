import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookOAuthService {
  constructor(private configService: ConfigService) {}

  async verifyToken(token: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture`
      );
      
      const profile = await response.json();
      
      if (profile.error) {
        throw new UnauthorizedException('Invalid Facebook token');
      }

      return {
        id: profile.id,
        email: profile.email,
        displayName: profile.name,
        photos: [{ value: profile.picture?.data?.url }],
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Facebook token');
    }
  }
}