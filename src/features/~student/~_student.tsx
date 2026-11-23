import { createFileRoute, Outlet } from '@tanstack/react-router';

import { StudentShell } from '@/components/layout';

export const Route = createFileRoute('/student/_student')({
  component: StudentLayoutRoute,
});

function StudentLayoutRoute() {
  return (
    <StudentShell>
      <Outlet />
    </StudentShell>
  );
}
