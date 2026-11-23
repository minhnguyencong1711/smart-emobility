import { useState, type ReactNode } from 'react';

import { AuthTransitIllustration, HcmutLogo } from '@/components/icons';
import { Button, CardRow, Modal } from '@/components/ui';
import { MOCK_ACCOUNTS } from '@/data';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-surface md:flex-row md:bg-canvas">
      {/* Mobile Compact Top Header (< md) */}
      <header className="flex items-center justify-between bg-navy-700 px-5 py-3.5 text-white md:hidden">
        <div className="flex items-center gap-2.5">
          <HcmutLogo size={28} />
          <span className="text-body-sm font-bold tracking-tight">
            VNU E-Mobility
          </span>
        </div>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="text-caption font-medium text-white/85 hover:text-white"
        >
          Help
        </button>
      </header>

      {/* Desktop Left Hero (>= md) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy px-8 py-9 text-white md:flex md:w-[46%] lg:w-1/2 lg:px-14 lg:py-11 xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-eco/15 blur-3xl"
        />

        <div className="relative flex items-center gap-3">
          <HcmutLogo size={38} />
          <span className="text-body-lg font-bold tracking-tight text-white">
            VNU E-Mobility
          </span>
        </div>

        <div className="relative my-auto max-w-[500px] space-y-6 py-8">
          <div className="space-y-2.5">
            <h1 className="font-display text-[30px] font-extrabold leading-tight tracking-tight text-white lg:text-[38px]">
              Smart &amp; Green Transit
            </h1>
            <p className="text-body text-white/80 lg:text-body-lg">
              EV rental &amp; smart charging across 5 hubs
            </p>
          </div>

          <AuthTransitIllustration className="pt-2" />
        </div>

        <div className="relative flex items-center justify-between text-caption text-white/75">
          <span className="font-bold tracking-wide text-white">HCMUT</span>
          <span>VNU-HCM E-Mobility Portal</span>
        </div>
      </aside>

      {/* Form Panel */}
      <main className="flex flex-1 flex-col items-center justify-center bg-surface px-5 py-6 md:w-[54%] md:bg-canvas md:p-8 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-[460px]">{children}</div>

        <footer className="mt-8 flex flex-col items-center gap-0.5 text-center md:hidden">
          <span className="text-caption font-bold text-ink-2">HCMUT</span>
          <span className="text-[11px] text-ink-3">
            VNU-HCM E-Mobility Portal
          </span>
        </footer>
      </main>

      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Campus Account Directory & Sign-In Help"
        size="md"
      >
        <div className="space-y-3 text-body-sm text-ink-2">
          <p>
            Sign in using one of the configured campus role accounts below, or
            create a new student account on the Sign Up screen:
          </p>
          <div className="rounded-md border border-line bg-surface-2 px-3 py-1">
            {MOCK_ACCOUNTS.map((acc) => (
              <CardRow key={acc.email}>
                <div>
                  <p className="font-mono text-caption font-bold text-ink">
                    {acc.email}
                  </p>
                  <p className="text-[11px] text-ink-3">{acc.profile.role}</p>
                </div>
                <code className="rounded bg-surface px-2 py-0.5 font-mono text-caption font-semibold text-primary-700">
                  {acc.password}
                </code>
              </CardRow>
            ))}
          </div>
          <div className="flex justify-end pt-1">
            <Button variant="primary" onClick={() => setHelpOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AuthLayout;
