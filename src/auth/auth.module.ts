import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOAuthService } from './services/google-oauth.service';
import { FacebookOAuthService } from './services/facebook-oauth.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        UsersModule,
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
        GoogleOAuthService,
        FacebookOAuthService,
    ],
    exports: [AuthService],
})
export class AuthModule { }
