import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './services/google-oauth.service';
import { FacebookOAuthService } from './services/facebook-oauth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { RegisterInput, LoginInput, OAuthLoginInput } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private googleOAuthService: GoogleOAuthService,
    private facebookOAuthService: FacebookOAuthService,
  ) {}

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthResponse)
  async loginWithGoogle(@Args('input') input: OAuthLoginInput): Promise<AuthResponse> {
    const profile = await this.googleOAuthService.verifyToken(input.token);
    return this.authService.handleOAuthLogin('google', profile, input.userType);
  }

  @Mutation(() => AuthResponse)
  async loginWithFacebook(@Args('input') input: OAuthLoginInput): Promise<AuthResponse> {
    const profile = await this.facebookOAuthService.verifyToken(input.token);
    return this.authService.handleOAuthLogin('facebook', profile, input.userType);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(@Args('token') token: string): Promise<AuthResponse> {
    return this.authService.refreshToken(token);
  }

  @Mutation(() => Boolean)
  async verifyEmail(@Args('token') token: string): Promise<boolean> {
    return this.authService.verifyEmail(token);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async resendVerificationEmail(@CurrentUser() user: User): Promise<boolean> {
    return this.authService.resendVerificationEmail(user.id);
  }
}