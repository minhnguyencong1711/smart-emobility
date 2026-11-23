import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState, type FormEvent } from 'react';

import { GoogleLogo } from '@/components/icons';
import { AuthLayout } from '@/components/layout';
import {
  Button,
  Callout,
  Card,
  Checkbox,
  Input,
  PasswordInput,
} from '@/components/ui';
import { useAuthStore, useToastStore } from '@/stores';
import { cn } from '@/utils/cn';

import { getPasswordStrength } from './utils/password-strength';

export const Route = createFileRoute('/sign-up/')({
  component: SignUpPage,
});

function SignUpPage() {
  const { registerAccount, loginWithGoogle } = useAuthStore();
  const pushToast = useToastStore((s) => s.pushToast);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('Nguyễn Công Minh');
  const [studentId, setStudentId] = useState('2212000');
  const [email, setEmail] = useState('minh.nguyen@example.com');
  const [phone, setPhone] = useState('0901234567');
  const [password, setPassword] = useState('Campus@2026');
  const [confirmPassword, setConfirmPassword] = useState('Campus@2026');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^\d{7}$/.test(studentId.trim())) {
      setFormError('Student ID (MSSV) must be 7 digits (e.g. 2212000).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setFormError('Phone number must be 10 digits.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Confirm password does not match.');
      return;
    }
    if (!agreedTerms) {
      setFormError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setFormError(null);
    registerAccount({
      fullName,
      studentId: studentId.trim(),
      email,
      password,
    });
    pushToast({
      tone: 'ok',
      title: 'Account created',
      description: `Welcome ${fullName}! Redirecting to Shared Vehicles.`,
    });
    navigate({ to: '/student/vehicles' });
  }

  return (
    <AuthLayout>
      <Card
        elevation={2}
        padding="lg"
        className="border-0 bg-transparent p-0 shadow-none md:border md:bg-surface md:p-8 md:shadow-2"
      >
        <div className="space-y-1">
          <h2 className="text-heading font-extrabold text-ink">
            Create Account
          </h2>
          <p className="text-body-sm text-ink-2">
            Sign up to access shared e-bikes &amp; fast charging at 5 hubs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            leadingIcon={<GoogleLogo size={18} />}
            onClick={() => {
              loginWithGoogle();
              pushToast({
                tone: 'ok',
                title: 'Signed up with Google',
                description: 'Authenticated with VNU-HCM Workspace account.',
              });
              navigate({ to: '/student/vehicles' });
            }}
          >
            Sign up with Google
          </Button>

          <div className="flex items-center gap-3 text-caption text-ink-muted">
            <span className="h-px flex-1 bg-line" />
            <span>or with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {formError ? (
            <Callout
              tone="danger"
              title="Check your registration details"
              description={formError}
            />
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Công Minh"
              required
            />
            <Input
              label="Student ID (MSSV)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="2212000"
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="minh.nguyen@example.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0901234567"
            required
          />

          <div className="space-y-1.5">
            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />
            <div className="flex items-center gap-2">
              <div className="grid flex-1 grid-cols-3 gap-1.5">
                {[1, 2, 3].map((segment) => {
                  const active = strength.level >= segment;
                  return (
                    <span
                      key={segment}
                      className={cn(
                        'h-1.5 rounded-full transition-colors',
                        !active
                          ? 'bg-surface-3'
                          : strength.level === 1
                            ? 'bg-danger'
                            : strength.level === 2
                              ? 'bg-eco'
                              : 'bg-ok',
                      )}
                    />
                  );
                })}
              </div>
              <span
                className={cn(
                  'text-caption font-semibold',
                  strength.level === 1
                    ? 'text-danger-700'
                    : strength.level >= 2
                      ? 'text-eco-700'
                      : 'text-ink-3',
                )}
              >
                {strength.label}
              </span>
            </div>
          </div>

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••"
            required
          />

          <Checkbox
            label="I agree to Terms of Service & Privacy Policy."
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
          />

          <Button type="submit" variant="primary" fullWidth>
            Create Account
          </Button>
        </form>

        <div className="mt-4 text-center text-caption text-ink-2">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-700 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
