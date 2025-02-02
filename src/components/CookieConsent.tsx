// components/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Проверяем, было ли уже получено согласие
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setShowConsent(false)
    // Здесь можно инициализировать GA после получения согласия
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted'
    })
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">
          We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
          By clicking "Accept", you consent to our use of cookies.
        </div>
        <div className="flex gap-4">
          <Button
            onClick={acceptCookies}
            variant="primary"
            size="sm"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}