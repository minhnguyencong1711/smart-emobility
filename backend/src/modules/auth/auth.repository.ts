import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createStudent(data: {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    initials: string;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: 'STUDENT',
        title: 'VNU-HCM Student',
      },
    });
  }

  recordFailedAttempt(id: string, failedAttempts: number, lockedUntil: Date | null) {
    return this.prisma.user.update({
      where: { id },
      data: { failedAttempts, lockedUntil },
    });
  }

  clearLockout(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  updatePasswordAndUnlock(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, failedAttempts: 0, lockedUntil: null },
    });
  }
}
