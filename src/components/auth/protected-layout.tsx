'use client'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  // Demo mode: no authentication required
  return <>{children}</>
}
