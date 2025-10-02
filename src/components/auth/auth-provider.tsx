'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (code: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 檢查本地存儲中是否有認證狀態
    const authStatus = localStorage.getItem('easypack_auth')
    const classicStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true' || classicStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (code: string) => {
    if (code === '2356') {
      setIsAuthenticated(true)
      localStorage.setItem('easypack_auth', 'true')
      localStorage.setItem('isAuthenticated', 'true')
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('easypack_auth')
    localStorage.removeItem('isAuthenticated')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
