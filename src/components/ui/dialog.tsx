import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DialogProps {
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function Dialog({ children, open, onOpenChange, className = '' }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    if (open) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onOpenChange(false)
    }
  }

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <div className={cn('bg-white', className)}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  )
}

export function DialogClose({ 
  onClick,
  className = ''
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <button 
      onClick={onClick}
      className={`absolute right-4 top-4 ${className}`}
    >
      ✕
    </button>
  )
}