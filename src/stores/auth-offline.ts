import { MOCK_ACCOUNTS, type MockAccount } from '@/data';
import type { ActionResult, UserProfile, UserRole } from '@/types';

export type LoginResult = {
  ok: boolean;
  error?: string;
  role?: UserRole;
};

export type RegisterPayload = {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile;
  accounts: MockAccount[];
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  rememberMe: boolean;
  resetTargetEmail: string;

  hydrateSession: () => Promise<void>;
  loginWithCredentials: (
    email: string,
    password: string,
  ) => Promise<LoginResult>;
  loginWithGoogle: () => Promise<void>;
  registerAccount: (payload: RegisterPayload) => Promise<ActionResult>;
  resetPasswordWithOtp: (
    otp: string,
    newPassword: string,
  ) => Promise<ActionResult>;
  resetLockout: () => void;
  setRememberMe: (value: boolean) => void;
  setResetTargetEmail: (email: string) => void;
  logout: () => void;
};

export const AUTH_STORAGE_KEY = 'emobility_auth_email';
export const LOCKOUT_DURATION_SECONDS = 900;

export function persistAuthEmail(email: string | null, remember: boolean) {
  if (typeof window === 'undefined') return;
  if (email && remember) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, email);
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function readInitialSession(): {
  isAuthenticated: boolean;
  user: UserProfile;
} {
  if (typeof window !== 'undefined') {
    const savedEmail = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedEmail) {
      const match = MOCK_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === savedEmail.toLowerCase(),
      );
      if (match) {
        return { isAuthenticated: true, user: match.profile };
      }
    }
  }
  return { isAuthenticated: false, user: MOCK_ACCOUNTS[0].profile };
}

export function evaluateOfflineLogin(params: {
  accounts: MockAccount[];
  email: string;
  password: string;
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  rememberMe: boolean;
}): {
  ok: boolean;
  error?: string;
  role?: UserRole;
  user?: UserProfile;
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
} {
  if (params.isLockedOut) {
    return {
      ok: false,
      error:
        'Account temporarily locked due to 5 failed sign-in attempts. Reset your password or wait for the cooldown timer.',
      failedAttempts: params.failedAttempts,
      isLockedOut: true,
      lockoutRemainingSeconds: params.lockoutRemainingSeconds,
    };
  }

  const matched = params.accounts.find(
    (acc) => acc.email.toLowerCase() === params.email,
  );
  if (!matched || matched.password !== params.password) {
    const nextAttempts = params.failedAttempts + 1;
    const locked = nextAttempts >= 5;
    return {
      ok: false,
      error: locked
        ? 'Too many failed sign-in attempts (5/5). Account locked for 15 minutes.'
        : `Invalid email or password. ${5 - nextAttempts} attempt(s) remaining before temporary lockout.`,
      failedAttempts: nextAttempts,
      isLockedOut: locked,
      lockoutRemainingSeconds: locked
        ? LOCKOUT_DURATION_SECONDS
        : params.lockoutRemainingSeconds,
    };
  }

  persistAuthEmail(matched.email, params.rememberMe);
  return {
    ok: true,
    role: matched.profile.role,
    user: matched.profile,
    failedAttempts: 0,
    isLockedOut: false,
    lockoutRemainingSeconds: params.lockoutRemainingSeconds,
  };
}

export function buildOfflineAccount(params: {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
}): MockAccount {
  const parts = params.fullName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : params.fullName.slice(0, 2).toUpperCase();

  return {
    email: params.email,
    password: params.password,
    profile: {
      id: `usr-${params.studentId}`,
      fullName: params.fullName,
      email: params.email,
      initials,
      role: 'STUDENT',
      title: 'VNU-HCM Student',
    },
  };
}
