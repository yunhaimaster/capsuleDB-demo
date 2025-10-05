"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/lib/utils'

interface ToastMessage {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    setToasts((previous) => {
      const newToast: ToastMessage = {
        id: crypto.randomUUID(),
        duration: 4000,
        variant: 'default',
        ...toast
      }
      return [...previous, newToast]
    })
  }, [])

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (!open) {
      setToasts((previous) => previous.filter((toast) => toast.id !== id))
    }
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <div className="fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-80">
          {toasts.map(({ id, title, description, duration, variant }) => (
            <ToastPrimitive.Root
              key={id}
              duration={duration}
              className={cn(
                'bg-white/90 backdrop-blur-lg border border-white/60 shadow-lg rounded-xl px-4 py-3 text-sm text-slate-800 flex flex-col gap-1',
                variant === 'destructive' && 'border-red-200 bg-red-50 text-red-700'
              )}
              onOpenChange={(open) => handleOpenChange(id, open)}
            >
              {title && <ToastPrimitive.Title className="font-medium text-base">{title}</ToastPrimitive.Title>}
              {description && (
                <ToastPrimitive.Description className="text-sm text-slate-600">
                  {description}
                </ToastPrimitive.Description>
              )}
            </ToastPrimitive.Root>
          ))}
        </div>
        <ToastPrimitive.Viewport className="pointer-events-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
