'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/toast-provider'
import { OfflineIndicator } from '@/hooks/use-offline'

export function AppClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <OfflineIndicator />
    </ToastProvider>
  )
}
