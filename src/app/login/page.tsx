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
    <div className="min-h-screen brand-logo-bg-animation">
      {/* Liquid Glass Navigation - 登陸頁面只顯示導航欄，無導航連結 */}
      <LiquidGlassNav 
        links={[]}
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4">
        <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-refraction max-w-xl mx-auto">
          <div className="liquid-glass-content">
            <div className="mb-6 space-y-2 text-center">
              <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-white/70 border border-white/60 text-[--brand-neutral] text-xs">
                <span className="font-medium tracking-wide">品牌登入</span>
                <span className="text-[11px] text-gray-500">Easy Health Capsule Management</span>
              </div>
              <h1 className="text-2xl font-semibold text-[--brand-neutral]">登入膠囊配方管理系統</h1>
              <p className="text-sm text-gray-600">使用授權登入碼存取專屬的 Liquid Glass 控制台</p>
            </div>
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      </div>
    </div>
  )
}
