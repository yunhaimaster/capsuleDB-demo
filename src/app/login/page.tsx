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
    <div className="min-h-screen animated-gradient-bg-subtle">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單管理' },
          { href: '/orders/new', label: '新建訂單' }
        ]}
        ctaText="系統登陸"
        ctaHref="/login"
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-20">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  )
}
