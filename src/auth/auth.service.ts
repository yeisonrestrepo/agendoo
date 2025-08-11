import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { OAuthConnection } from '../users/entities/oauth-connection.entity';
import { LoginInput, RegisterInput, OAuthLoginInput } from './dto/auth.dto';
import { AuthResponse } from './dto/auth-response.dto';

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
  ) {}

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = this.usersRepository.create({
      email: input.email,
      passwordHash: hashedPassword,
      role: input.role || UserRole.CLIENT,
    });

    const savedUser = await this.usersRepository.save(user);

    const profile = this.profilesRepository.create({
      userId: savedUser.id,
      name: input.name,
    });

    await this.profilesRepository.save(profile);

    const tokens = this.generateTokens(savedUser);

    return {
      ...tokens,
      user: { ...savedUser, profile },
      requiresOnboarding: savedUser.role === UserRole.BARBER,
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

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user,
      requiresOnboarding: user.role === UserRole.BARBER && !user.profile?.onboardingCompleted,
    };
  }

  async handleOAuthLogin(
    provider: string,
    profile: any,
    userType: UserRole,
  ): Promise<AuthResponse> {
    // 1. Verificar si ya existe conexión OAuth
    let oauthConnection = await this.oauthRepository.findOne({
      where: { provider, providerId: profile.id },
      relations: ['user', 'user.profile'],
    });

    if (oauthConnection) {
      const tokens = this.generateTokens(oauthConnection.user);
      return {
        ...tokens,
        user: oauthConnection.user,
        requiresOnboarding: oauthConnection.user.role === UserRole.BARBER && 
                          !oauthConnection.user.profile?.onboardingCompleted,
      };
    }

    // 2. Verificar si existe usuario con mismo email
    let user = await this.usersRepository.findOne({
      where: { email: profile.email },
      relations: ['profile'],
    });

    if (!user) {
      // 3. Crear nuevo usuario
      user = this.usersRepository.create({
        email: profile.email,
        role: userType,
        emailVerified: true,
      });

      user = await this.usersRepository.save(user);

      // Crear perfil inicial con datos OAuth
      const newProfile = this.profilesRepository.create({
        userId: user.id,
        name: profile.displayName || profile.name,
        avatarUrl: profile.photos?.[0]?.value,
      });

      user.profile = await this.profilesRepository.save(newProfile);
    }

    // 4. Crear conexión OAuth
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
      requiresOnboarding: user.role === UserRole.BARBER && !user.profile?.onboardingCompleted,
    };
  }

  private generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
  }
}