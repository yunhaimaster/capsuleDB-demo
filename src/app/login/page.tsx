'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      router.push('/')
    }
  }, [router])

  const handleLogin = (code: string) => {
    // Store authentication status
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
    router.push('/')
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      {/* Liquid Glass Navigation - 登陸頁面只顯示導航欄，無導航連結 */}
      <LiquidGlassNav 
        links={[]}
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  )
}
