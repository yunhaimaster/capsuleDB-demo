'use client'

import { createContext, useContext } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (code: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Demo mode: always authenticated, no checks required
  const login = (code: string) => {
    // No-op for demo mode
  }

  const logout = () => {
    // No-op for demo mode
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: true, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
