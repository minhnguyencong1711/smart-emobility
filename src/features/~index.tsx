import { createFileRoute, Navigate } from '@tanstack/react-router';

import { useAuthStore } from '@/stores';

export const Route = createFileRoute('/')({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'OPERATOR' || user.role === 'ADMIN') {
    return <Navigate to="/operator/monitoring" />;
  }

  return <Navigate to="/student/vehicles" />;
}
