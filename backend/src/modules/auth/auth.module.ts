import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { appConfig } from '../../config/app.config';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: appConfig.auth.jwtSecret,
      signOptions: { expiresIn: appConfig.auth.jwtExpiresInSeconds },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
