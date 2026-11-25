import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import type { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const passwordHash = bcrypt.hashSync('student123', 4);
  const baseUser = {
    id: 'usr-sv-01',
    email: 'student@vnuhcm.edu.vn',
    passwordHash,
    fullName: 'Nguyễn Công Minh',
    initials: 'CM',
    role: 'STUDENT',
    title: 'VNU-HCM Student',
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let authRepo: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let service: AuthService;

  beforeEach(() => {
    authRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createStudent: jest.fn(),
      recordFailedAttempt: jest.fn(),
      clearLockout: jest.fn(),
      updatePasswordAndUnlock: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    } as unknown as jest.Mocked<JwtService>;

    service = new AuthService(authRepo, jwtService);
  });

  it('issues JWT and returns profile on valid login', async () => {
    authRepo.findByEmail.mockResolvedValue(baseUser);
    const result = await service.login({
      email: 'student@vnuhcm.edu.vn',
      password: 'student123',
    });

    expect(result.accessToken).toBe('mock-jwt-token');
    expect(result.user.fullName).toBe('Nguyễn Công Minh');
  });

  it('locks account for 15 minutes on the 5th failed login attempt', async () => {
    authRepo.findByEmail.mockResolvedValue({ ...baseUser, failedAttempts: 4 });

    await expect(
      service.login({
        email: 'student@vnuhcm.edu.vn',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(authRepo.recordFailedAttempt).toHaveBeenCalledWith(
      'usr-sv-01',
      5,
      expect.any(Date),
    );
  });

  it('rejects login when account is currently locked', async () => {
    authRepo.findByEmail.mockResolvedValue({
      ...baseUser,
      failedAttempts: 5,
      lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
    });

    await expect(
      service.login({
        email: 'student@vnuhcm.edu.vn',
        password: 'student123',
      }),
    ).rejects.toThrow(/temporarily locked/i);
  });
});
