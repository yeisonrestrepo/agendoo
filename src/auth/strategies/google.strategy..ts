import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;

      // Validar que tenemos la información mínima requerida
      if (!id) {
        return done(new Error('Google profile ID is required'), undefined);
      }

      // Validar email
      if (!emails || !emails.length || !emails[0]?.value) {
        return done(new Error('Google email is required'), undefined);
      }

      // Construir nombre de display de forma segura
      let displayName = 'Usuario Google';
      if (name) {
        const firstName = name.givenName || '';
        const lastName = name.familyName || '';
        displayName = `${firstName} ${lastName}`.trim() || name.displayName || 'Usuario Google';
      }

      const user = {
        id,
        email: emails[0].value,
        displayName,
        photos: photos || [],
      };

      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  }
}