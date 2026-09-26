'use client';

import { useAuthBootstrap } from '../hooks/use-auth-bootstrap';

export function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return <>{children}</>;
}