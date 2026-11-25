import { create } from 'zustand';

import { MOCK_ACCOUNTS } from '@/data';
import {
  ApiHttpError,
  backendApi,
  getStoredAccessToken,
  setStoredAccessToken,
} from '@/services';

import {
  type AuthState,
  buildOfflineAccount,
  evaluateOfflineLogin,
  LOCKOUT_DURATION_SECONDS,
  persistAuthEmail,
  readInitialSession,
} from './auth-offline';

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

  hydrateSession: async () => {
    const token = getStoredAccessToken();
    if (!token) return;
    try {
      const profile = await backendApi.me();
      set({ isAuthenticated: true, user: profile });
    } catch (err) {
      if (err instanceof ApiHttpError && err.status === 401) {
        setStoredAccessToken(null);
      }
    }
  },

  loginWithCredentials: async (email, password) => {
    const state = get();
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return {
        ok: false,
        error: 'Please enter a valid VNU-HCM email address.',
      };
    }

    try {
      const res = await backendApi.login(trimmedEmail, password);
      setStoredAccessToken(res.accessToken);
      persistAuthEmail(res.user.email, state.rememberMe);
      set({
        isAuthenticated: true,
        user: res.user,
        failedAttempts: 0,
        isLockedOut: false,
      });
      return { ok: true, role: res.user.role };
    } catch (err) {
      if (err instanceof ApiHttpError) {
        const locked = err.message.toLowerCase().includes('locked');
        set({
          failedAttempts: locked ? 5 : Math.min(5, state.failedAttempts + 1),
          isLockedOut: locked,
          lockoutRemainingSeconds: locked
            ? LOCKOUT_DURATION_SECONDS
            : state.lockoutRemainingSeconds,
        });
        return { ok: false, error: err.message };
      }
    }

    const fallback = evaluateOfflineLogin({
      accounts: state.accounts,
      email: trimmedEmail,
      password,
      failedAttempts: state.failedAttempts,
      isLockedOut: state.isLockedOut,
      lockoutRemainingSeconds: state.lockoutRemainingSeconds,
      rememberMe: state.rememberMe,
    });
    set({
      failedAttempts: fallback.failedAttempts,
      isLockedOut: fallback.isLockedOut,
      lockoutRemainingSeconds: fallback.lockoutRemainingSeconds,
      ...(fallback.ok && fallback.user
        ? { isAuthenticated: true, user: fallback.user }
        : {}),
    });
    return { ok: fallback.ok, error: fallback.error, role: fallback.role };
  },

  loginWithGoogle: async () => {
    const defaultStudent = get().accounts[0];
    try {
      const res = await backendApi.login(
        defaultStudent.email,
        defaultStudent.password,
      );
      setStoredAccessToken(res.accessToken);
      persistAuthEmail(res.user.email, get().rememberMe);
      set({
        isAuthenticated: true,
        user: res.user,
        failedAttempts: 0,
        isLockedOut: false,
      });
    } catch {
      persistAuthEmail(defaultStudent.email, get().rememberMe);
      set({
        isAuthenticated: true,
        user: defaultStudent.profile,
        failedAttempts: 0,
        isLockedOut: false,
      });
    }
  },

  registerAccount: async ({ fullName, studentId, email, password }) => {
    const cleanName = fullName.trim() || 'VNU-HCM Student';
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await backendApi.register({
        fullName: cleanName,
        email: normalizedEmail,
        password,
      });
      setStoredAccessToken(res.accessToken);
      persistAuthEmail(res.user.email, true);
      set({
        isAuthenticated: true,
        failedAttempts: 0,
        isLockedOut: false,
        user: res.user,
      });
      return { ok: true };
    } catch (err) {
      if (err instanceof ApiHttpError) {
        return { ok: false, error: err.message };
      }
    }

    const newAccount = buildOfflineAccount({
      fullName: cleanName,
      studentId,
      email: normalizedEmail,
      password,
    });
    persistAuthEmail(normalizedEmail, true);
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
    return { ok: true };
  },

  resetPasswordWithOtp: async (otp, newPassword) => {
    const email = get().resetTargetEmail.trim().toLowerCase();
    try {
      await backendApi.resetPassword(email, otp, newPassword);
    } catch (err) {
      if (err instanceof ApiHttpError) {
        return { ok: false, error: err.message };
      }
    }
    set({
      failedAttempts: 0,
      isLockedOut: false,
      lockoutRemainingSeconds: LOCKOUT_DURATION_SECONDS,
    });
    return { ok: true };
  },

  resetLockout: () => {
    const email = get().resetTargetEmail;
    void backendApi.resetLockout(email).catch(() => undefined);
    set({
      failedAttempts: 0,
      isLockedOut: false,
      lockoutRemainingSeconds: LOCKOUT_DURATION_SECONDS,
    });
  },

  setRememberMe: (value) => set({ rememberMe: value }),
  setResetTargetEmail: (email) => set({ resetTargetEmail: email }),

  logout: () => {
    setStoredAccessToken(null);
    persistAuthEmail(null, false);
    set({
      isAuthenticated: false,
      failedAttempts: 0,
      isLockedOut: false,
    });
  },
}));
