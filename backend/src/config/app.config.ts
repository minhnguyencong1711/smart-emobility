import 'dotenv/config';

export const appConfig = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'smart-emobility-vnu-hcm-dev-secret',
    jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400),
    lockoutMaxAttempts: 5,
    lockoutDurationMs: 15 * 60 * 1000,
    bcryptRounds: 10,
  },
} as const;
