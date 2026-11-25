import { createRouter, RouterProvider } from '@tanstack/react-router';

import { BackendSync } from '@/components/shared';
import { ToastViewport } from '@/components/ui';

import { routeTree } from './routeTree.gen';

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <>
      <BackendSync />
      <RouterProvider router={router} />
      <ToastViewport />
    </>
  );
}

export default App;
