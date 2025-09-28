'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLogout, setIsLogout] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 檢查是否是登出操作
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('logout') === 'true') {
      // 清除所有認證狀態
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('easypack_auth')
      setIsLogout(true)
      setIsAuthenticated(false)
      return
    }

    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    const easypackAuth = localStorage.getItem('easypack_auth')
    if (authStatus === 'true' || easypackAuth === 'true') {
      setIsAuthenticated(true)
      router.push('/')
    }
  }, [router])

  const handleLogin = (code: string) => {
    // Store authentication status
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('easypack_auth', 'true') // 統一認證系統
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
