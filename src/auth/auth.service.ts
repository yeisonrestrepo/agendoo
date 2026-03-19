import { Injectable, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { User, UserRole } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { OAuthConnection } from '../users/entities/oauth-connection.entity';
import { LoginInput, RegisterInput } from './dto/auth.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { OAuthProfile } from './interfaces/oauth-profile.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(OAuthConnection)
    private oauthRepository: Repository<OAuthConnection>,
    private jwtService: JwtService,
    private notifications: NotificationsService,
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const { token: verificationToken, expiry: verificationExpiry } = this.generateVerificationToken();

    const user = this.usersRepository.create({
      email: input.email,
      passwordHash: hashedPassword,
      role: input.role || UserRole.CLIENT,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    const savedUser = await this.usersRepository.save(user);

    const profile = this.profilesRepository.create({
      userId: savedUser.id,
      name: input.name,
    });

    await this.profilesRepository.save(profile);

    this.sendVerificationEmail(savedUser.email, verificationToken);

    const tokens = this.generateTokens(savedUser);

    return {
      ...tokens,
      user: { ...savedUser, profile },
      requiresOnboarding: savedUser.role === UserRole.BUSINESS_OWNER,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: input.email },
      relations: ['profile'],
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is suspended');
    }

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
      requiresOnboarding: user.role === UserRole.BUSINESS_OWNER && !user.profile?.onboardingCompleted,
    };
  }

  async handleOAuthLogin(
    provider: string,
    profile: OAuthProfile,
    userType?: UserRole,
  ): Promise<AuthResponse> {
    if (!profile.email) {
      throw new InternalServerErrorException('OAuth provider did not return an email address');
    }

    let oauthConnection = await this.oauthRepository.findOne({
      where: { provider, providerId: profile.id },
      relations: ['user', 'user.profile'],
    });

    if (oauthConnection) {
      const tokens = this.generateTokens(oauthConnection.user);
      return {
        ...tokens,
        user: oauthConnection.user,
        requiresOnboarding: oauthConnection.user.role === UserRole.BUSINESS_OWNER &&
                          !oauthConnection.user.profile?.onboardingCompleted,
      };
    }

    let user = await this.usersRepository.findOne({
      where: { email: profile.email },
      relations: ['profile'],
    });

    if (!user) {
      user = this.usersRepository.create({
        email: profile.email,
        role: userType ?? UserRole.CLIENT,
        emailVerified: true,
      });

      user = await this.usersRepository.save(user);

      const newProfile = this.profilesRepository.create({
        userId: user.id,
        name: profile.displayName || profile.email,
        avatarUrl: profile.photos?.[0]?.value,
      });

      user.profile = await this.profilesRepository.save(newProfile);
    }

    const newConnection = this.oauthRepository.create({
      userId: user.id,
      provider,
      providerId: profile.id,
      providerEmail: profile.email,
    });

    await this.oauthRepository.save(newConnection);

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
      requiresOnboarding: user.role === UserRole.BUSINESS_OWNER && !user.profile?.onboardingCompleted,
    };
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = { email: user.email, sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
      select: ['id', 'emailVerified', 'emailVerificationToken', 'emailVerificationExpiry'],
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.emailVerified) {
      return true;
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('Verification token has expired. Please request a new one.');
    }

    await this.usersRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    });

    return true;
  }

  async resendVerificationEmail(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const { token, expiry } = this.generateVerificationToken();

    await this.usersRepository.update(userId, {
      emailVerificationToken: token,
      emailVerificationExpiry: expiry,
    });

    this.sendVerificationEmail(user.email, token);

    return true;
  }

  private generateVerificationToken(): { token: string; expiry: Date } {
    const token = randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return { token, expiry };
  }

  private sendVerificationEmail(email: string, token: string): void {
    this.notifications.sendVerificationEmail(email, token).catch(() => null);
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
      relations: ['profile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is suspended');
    }

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
      requiresOnboarding: user.role === UserRole.BUSINESS_OWNER && !user.profile?.onboardingCompleted,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, active: true },
      relations: ['profile'],
    });
    return user;
  }
}