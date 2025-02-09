// components/RootProvider.tsx
'use client';

import { usePathname } from 'next/navigation';
import { usePageTracking } from '@/hooks/usePageTracking';

export function RootProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && children}
      {isAdmin && <>{children}</>}
    </>
  );
}