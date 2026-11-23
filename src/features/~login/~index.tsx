import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';

import { GoogleLogo } from '@/components/icons';
import { AuthLayout } from '@/components/layout';
import {
  Button,
  Callout,
  Card,
  Checkbox,
  CountdownTimer,
  Input,
  PasswordInput,
} from '@/components/ui';
import { useAuthStore, useToastStore } from '@/stores';

export const Route = createFileRoute('/login/')({
  component: LoginPage,
});

function LoginPage() {
  const {
    failedAttempts,
    isLockedOut,
    lockoutRemainingSeconds,
    rememberMe,
    setRememberMe,
    loginWithCredentials,
    loginWithGoogle,
    resetLockout,
  } = useAuthStore();
  const pushToast = useToastStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [lockSeconds, setLockSeconds] = useState(lockoutRemainingSeconds);

  useEffect(() => {
    setLockSeconds(lockoutRemainingSeconds);
  }, [lockoutRemainingSeconds, isLockedOut]);

  useEffect(() => {
    if (!isLockedOut) return;
    const timer = window.setInterval(() => {
      setLockSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isLockedOut]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const res = loginWithCredentials(email, password);
    if (!res.ok) {
      setFormError(res.error ?? 'Unable to sign in.');
      return;
    }
    setFormError(null);
    pushToast({
      tone: 'ok',
      title: 'Signed in successfully',
      description: `Welcome back (${email}).`,
    });
    if (res.role === 'FIELD_CREW') {
      navigate({ to: '/operator/redistribution' });
    } else if (res.role === 'OPERATOR' || res.role === 'ADMIN') {
      navigate({ to: '/operator/monitoring' });
    } else {
      navigate({ to: '/student/vehicles' });
    }
  }

  return (
    <AuthLayout>
      <Card
        elevation={2}
        padding="lg"
        className="border-0 bg-transparent p-0 shadow-none md:border md:bg-surface md:p-8 md:shadow-2"
      >
        <div className="space-y-1">
          <h2 className="hidden text-heading font-extrabold text-ink md:block">
            Sign In
          </h2>
          <h2 className="text-heading font-extrabold text-ink md:hidden">
            Welcome!
          </h2>
          <p className="text-body-sm text-ink-2 md:hidden">
            Reserve bikes &amp; charging bays across campus
          </p>
          <p className="hidden text-body-sm text-ink-2 md:block">
            Enter your credentials to access E-Mobility Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            leadingIcon={<GoogleLogo size={18} />}
            disabled={isLockedOut}
            onClick={() => {
              loginWithGoogle();
              pushToast({
                tone: 'ok',
                title: 'Google Workspace SSO verified',
                description: 'Signed in as student@vnuhcm.edu.vn.',
              });
              navigate({ to: '/student/vehicles' });
            }}
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-caption text-ink-muted">
            <span className="h-px flex-1 bg-line" />
            <span>or with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {isLockedOut ? (
            <Callout
              tone="danger"
              title="Account Temporarily Locked"
              description="Too many failed sign-in attempts (5/5). Please wait for the cooldown or reset your password."
              action={
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <CountdownTimer
                    secondsRemaining={lockSeconds}
                    label="Lockout"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      resetLockout();
                      setFormError(null);
                      pushToast({
                        tone: 'info',
                        title: 'Account unlocked',
                        description: 'Failed attempt counter reset to 0.',
                      });
                    }}
                  >
                    Reset Lockout
                  </Button>
                </div>
              }
            />
          ) : null}

          {formError && !isLockedOut ? (
            <Callout
              tone="warn"
              title="Sign-in failed"
              description={formError}
            />
          ) : null}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@vnuhcm.edu.vn"
            disabled={isLockedOut}
            required
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLockedOut}
            trailingLabel={
              <Link
                to="/reset-password"
                className="text-caption font-semibold text-primary-700 hover:underline"
              >
                Forgot?
              </Link>
            }
            required
          />

          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              label="Remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            {failedAttempts > 0 && !isLockedOut ? (
              <span className="font-mono text-caption font-semibold text-warn-700">
                Attempts: {failedAttempts}/5
              </span>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLockedOut}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-5 text-center text-caption text-ink-2">
          New to the portal?{' '}
          <Link
            to="/sign-up"
            className="font-semibold text-primary-700 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
