'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

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
    <div className="min-h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  )
}
