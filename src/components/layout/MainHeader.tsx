'use client'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'

export function MainHeader() {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return <Header />
}