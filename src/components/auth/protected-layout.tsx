'use client'

import { useAuth } from './auth-provider'
import { LoginForm } from './login-form'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, login } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  return <>{children}</>
}
