import { createFileRoute, Outlet } from '@tanstack/react-router';

import { OperatorShell } from '@/components/layout';

export const Route = createFileRoute('/operator/_operator')({
  component: OperatorLayoutRoute,
});

function OperatorLayoutRoute() {
  return (
    <OperatorShell>
      <Outlet />
    </OperatorShell>
  );
}
