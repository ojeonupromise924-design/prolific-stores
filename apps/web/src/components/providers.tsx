'use client';

import { useEffect } from 'react';
import { useAuthBootstrap } from '../hooks/use-auth-bootstrap';
import { ToastHost } from './toast';

export function Providers({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return (
    <>
      {children}
      <ToastHost />
    </>
  );

  // Inside the Providers component, alongside useAuthBootstrap():
useEffect(() => {
  function handlePageShow(e: PageTransitionEvent) {
    if (e.persisted) {
      // Page restored from bfcache (e.g. browser back button) —
      // force a reload so auth state is re-validated from scratch
      // instead of showing stale, possibly-logged-out-but-cached UI.
      window.location.reload();
    }
  }
  window.addEventListener('pageshow', handlePageShow);
  return () => window.removeEventListener('pageshow', handlePageShow);
}, []);
}



