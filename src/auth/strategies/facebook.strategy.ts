import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: '/auth/facebook/callback',
      scope: 'email',
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      const { id, name, emails, photos } = profile;
      
      // Validar que tenemos la información mínima requerida
      if (!id) {
        return done(new Error('Facebook profile ID is required'), null);
      }

      // Validar email
      if (!emails || !emails.length || !emails[0]?.value) {
        return done(new Error('Facebook email is required'), null);
      }

      // Construir nombre de display de forma segura
      let displayName = 'Usuario Facebook';
      if (name) {
        const firstName = name.givenName || '';
        const lastName = name.familyName || '';
        displayName = `${firstName} ${lastName}`.trim() || 'Usuario Facebook';
      }

      const user = {
        id,
        email: emails[0].value,
        displayName,
        photos: photos || [],
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}