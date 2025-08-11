import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy.';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleOAuthService } from './services/google-oauth.service';
import { FacebookOAuthService } from './services/facebook-oauth.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        AuthService,
        AuthResolver,
        JwtStrategy,
        GoogleStrategy,
        FacebookStrategy,
        GoogleOAuthService,
        FacebookOAuthService,
    ],
    exports: [AuthService],
})
export class AuthModule { }
