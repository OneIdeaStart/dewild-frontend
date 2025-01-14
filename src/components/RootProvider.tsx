// components/RootProvider.tsx
'use client';

import { usePageTracking } from '@/hooks/usePageTracking'

export function RootProvider({ children }: { children: React.ReactNode }) {
  usePageTracking()
  return <>{children}</>
}