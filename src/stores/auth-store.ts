import { create } from 'zustand';

import { MOCK_ACCOUNTS, type MockAccount } from '@/data';
import type { UserProfile, UserRole } from '@/types';

type LoginResult = {
  ok: boolean;
  error?: string;
  role?: UserRole;
};

type RegisterPayload = {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile;
  accounts: MockAccount[];
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  rememberMe: boolean;
  resetTargetEmail: string;

  loginWithCredentials: (email: string, password: string) => LoginResult;
  loginWithGoogle: () => void;
  registerAccount: (payload: RegisterPayload) => void;
  resetLockout: () => void;
  setRememberMe: (value: boolean) => void;
  setResetTargetEmail: (email: string) => void;
  logout: () => void;
};

const STORAGE_KEY = 'emobility_auth_email';
const LOCKOUT_DURATION_SECONDS = 900;

function readInitialSession(): {
  isAuthenticated: boolean;
  user: UserProfile;
} {
  if (typeof window !== 'undefined') {
    const savedEmail = window.localStorage.getItem(STORAGE_KEY);
    if (savedEmail) {
      const match = MOCK_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === savedEmail.toLowerCase(),
      );
      if (match) {
        return { isAuthenticated: true, user: match.profile };
      }
    }
  }
  return {
    isAuthenticated: false,
    user: MOCK_ACCOUNTS[0].profile,
  };
}

const initialSession = readInitialSession();

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: initialSession.isAuthenticated,
  user: initialSession.user,
  accounts: MOCK_ACCOUNTS,
  failedAttempts: 0,
  isLockedOut: false,
  lockoutRemainingSeconds: LOCKOUT_DURATION_SECONDS,
  rememberMe: true,
  resetTargetEmail: 'student@vnuhcm.edu.vn',

  loginWithCredentials: (email, password) => {
    const state = get();
    if (state.isLockedOut) {
      return {
        ok: false,
        error:
          'Account temporarily locked due to 5 failed sign-in attempts. Reset your password or wait for the cooldown timer.',
      };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isValidEmail) {
      return {
        ok: false,
        error: 'Please enter a valid VNU-HCM email address.',
      };
    }

    const matchedAccount = state.accounts.find(
      (acc) => acc.email.toLowerCase() === trimmedEmail,
    );

    if (!matchedAccount || matchedAccount.password !== password) {
      const nextAttempts = state.failedAttempts + 1;
      const locked = nextAttempts >= 5;
      set({
        failedAttempts: nextAttempts,
        isLockedOut: locked,
        lockoutRemainingSeconds: locked
          ? LOCKOUT_DURATION_SECONDS
          : state.lockoutRemainingSeconds,
      });
      return {
        ok: false,
        error: locked
          ? 'Too many failed sign-in attempts (5/5). Account locked for 15 minutes.'
          : `Invalid email or password. ${5 - nextAttempts} attempt(s) remaining before temporary lockout.`,
      };
    }

    if (typeof window !== 'undefined') {
      if (state.rememberMe) {
        window.localStorage.setItem(STORAGE_KEY, matchedAccount.email);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    set({
      isAuthenticated: true,
      user: matchedAccount.profile,
      failedAttempts: 0,
      isLockedOut: false,
    });
    return { ok: true, role: matchedAccount.profile.role };
  },

  loginWithGoogle: () => {
    const defaultStudent = get().accounts[0];
    if (typeof window !== 'undefined' && get().rememberMe) {
      window.localStorage.setItem(STORAGE_KEY, defaultStudent.email);
    }
    set({
      isAuthenticated: true,
      user: defaultStudent.profile,
      failedAttempts: 0,
      isLockedOut: false,
    });
  },

  registerAccount: ({ fullName, studentId, email, password }) => {
    const cleanName = fullName.trim() || 'VNU-HCM Student';
    const parts = cleanName.split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    const newAccount: MockAccount = {
      email: normalizedEmail,
      password,
      profile: {
        id: `usr-${studentId}`,
        fullName: cleanName,
        email: normalizedEmail,
        initials,
        role: 'STUDENT',
        title: 'VNU-HCM Student',
      },
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, normalizedEmail);
    }

    set((state) => ({
      isAuthenticated: true,
      failedAttempts: 0,
      isLockedOut: false,
      accounts: [
        ...state.accounts.filter(
          (a) => a.email.toLowerCase() !== normalizedEmail,
        ),
        newAccount,
      ],
      user: newAccount.profile,
    }));
  },

  resetLockout: () =>
    set({
      failedAttempts: 0,
      isLockedOut: false,
      lockoutRemainingSeconds: LOCKOUT_DURATION_SECONDS,
    }),

  setRememberMe: (value) => set({ rememberMe: value }),
  setResetTargetEmail: (email) => set({ resetTargetEmail: email }),

  logout: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set({
      isAuthenticated: false,
      failedAttempts: 0,
      isLockedOut: false,
    });
  },
}));
