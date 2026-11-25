import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import { appConfig } from '../../config/app.config';
import { AuthRepository } from './auth.repository';
import type {
  LoginDto,
  RegisterDto,
  ResetLockoutDto,
  ResetPasswordDto,
} from './dto/auth.dto';

export type PublicUserProfile = {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  role: string;
  title: string;
};

function toPublicProfile(user: User): PublicUserProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    initials: user.initials,
    role: user.role,
    title: user.title,
  };
}

function deriveInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return fullName.trim().slice(0, 2).toUpperCase() || 'ST';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const remainingMins = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account temporarily locked due to failed sign-in attempts. Try again in ${remainingMins} minute(s) or reset password.`,
      );
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const nextAttempts = user.failedAttempts + 1;
      const locked = nextAttempts >= appConfig.auth.lockoutMaxAttempts;
      const lockedUntil = locked
        ? new Date(Date.now() + appConfig.auth.lockoutDurationMs)
        : null;
      await this.authRepository.recordFailedAttempt(
        user.id,
        nextAttempts,
        lockedUntil,
      );
      throw new UnauthorizedException(
        locked
          ? 'Too many failed sign-in attempts (5/5). Account locked for 15 minutes.'
          : `Invalid email or password. ${appConfig.auth.lockoutMaxAttempts - nextAttempts} attempt(s) remaining before temporary lockout.`,
      );
    }

    if (user.failedAttempts > 0 || user.lockedUntil) {
      await this.authRepository.clearLockout(user.id);
    }

    return this.issueTokenResponse(user);
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.authRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      appConfig.auth.bcryptRounds,
    );
    const created = await this.authRepository.createStudent({
      id: `usr-${Date.now()}`,
      email,
      passwordHash,
      fullName: dto.fullName.trim(),
      initials: deriveInitials(dto.fullName),
    });

    return this.issueTokenResponse(created);
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found.');
    return toPublicProfile(user);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('No campus account found for that email.');
    }
    if (!/^\d{6}$/.test(dto.otp)) {
      throw new BadRequestException('Verification code must be 6 digits.');
    }
    const hash = await bcrypt.hash(
      dto.newPassword,
      appConfig.auth.bcryptRounds,
    );
    await this.authRepository.updatePasswordAndUnlock(user.id, hash);
    return { ok: true };
  }

  async resetLockout(dto: ResetLockoutDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.authRepository.findByEmail(email);
    if (user) {
      await this.authRepository.clearLockout(user.id);
    }
    return { ok: true };
  }

  private async issueTokenResponse(user: User) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      accessToken,
      user: toPublicProfile(user),
    };
  }
}
