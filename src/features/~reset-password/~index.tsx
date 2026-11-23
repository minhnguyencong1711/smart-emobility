import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';

import { LockIcon } from '@/components/icons';
import { AuthLayout } from '@/components/layout';
import {
  Button,
  Callout,
  Card,
  Input,
  OtpInput,
  PasswordInput,
} from '@/components/ui';
import { useInterval } from '@/hooks';
import { useAuthStore, useToastStore } from '@/stores';
import { cn } from '@/utils/cn';
import { formatClockSeconds } from '@/utils/formatters';

export const Route = createFileRoute('/reset-password/')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { resetTargetEmail, setResetTargetEmail, resetLockout } =
    useAuthStore();
  const pushToast = useToastStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [editingEmail, setEditingEmail] = useState(false);
  const [digits, setDigits] = useState<string[]>(['2', '4', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(54);
  const [newPassword, setNewPassword] = useState('Campus@2026');
  const [formError, setFormError] = useState<string | null>(null);

  useInterval(
    () => setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0)),
    secondsLeft > 0 ? 1000 : null,
  );

  function handleResend() {
    setSecondsLeft(60);
    setFormError(null);
    pushToast({
      tone: 'info',
      title: 'Verification code resent',
      description: `A fresh 6-digit OTP was sent to ${resetTargetEmail}.`,
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (secondsLeft <= 0) {
      setFormError('OTP code has expired. Click Resend to get a new code.');
      return;
    }
    const code = digits.join('');
    if (code.length < 6) {
      setFormError('Please enter all 6 digits of your verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    setFormError(null);
    resetLockout();
    pushToast({
      tone: 'ok',
      title: 'Password updated',
      description: 'Your password has been reset. You can now sign in.',
    });
    navigate({ to: '/login' });
  }

  return (
    <AuthLayout>
      <Card
        elevation={2}
        padding="lg"
        className="border-0 bg-transparent p-0 shadow-none md:border md:bg-surface md:p-8 md:shadow-2"
      >
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-md border border-line bg-surface-2 text-ink">
            <LockIcon size={20} />
          </span>
          <h2 className="mt-3 text-heading font-extrabold text-ink">
            Reset Password
          </h2>
          <p className="mt-1 text-body-sm text-ink-2">
            Enter 6-digit code sent to{' '}
            <strong className="font-semibold text-ink">
              {resetTargetEmail}
            </strong>
          </p>
          <Button
            size="sm"
            variant="link"
            onClick={() => setEditingEmail((v) => !v)}
            className="mt-1"
          >
            {editingEmail ? 'Done editing email' : 'Change email'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {editingEmail ? (
            <Input
              label="Campus Email"
              type="email"
              value={resetTargetEmail}
              onChange={(e) => setResetTargetEmail(e.target.value)}
            />
          ) : null}

          {formError ? (
            <Callout
              tone="danger"
              title="Reset verification failed"
              description={formError}
            />
          ) : null}

          <div>
            <OtpInput value={digits} onChange={setDigits} />

            <div className="mt-2.5 flex items-center justify-between text-caption">
              <span
                className={cn(
                  'font-semibold',
                  secondsLeft === 0 ? 'text-danger-700' : 'text-warn-700',
                )}
              >
                {secondsLeft === 0
                  ? 'Code expired'
                  : `Expires in ${formatClockSeconds(secondsLeft)}`}
              </span>
              <Button size="sm" variant="link" onClick={handleResend}>
                Resend
              </Button>
            </div>
          </div>

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••"
            required
          />

          <Button type="submit" variant="primary" size="lg" fullWidth>
            Reset Password
          </Button>
        </form>

        <p className="mt-5 text-center text-body-sm text-ink-2">
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:underline"
          >
            ← Back to Sign in
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
