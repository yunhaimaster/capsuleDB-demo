'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

interface LoginFormProps {
  onLogin: (code: string) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === '2356') {
      onLogin(code)
      setError('')
    } else {
      setError('登陸碼錯誤，請重新輸入')
    }
  }

  return (
    <div className="flex items-center justify-center floating-particles py-8">
      <Card className="liquid-glass-card liquid-glass-card-elevated w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-500/10 rounded-full w-fit">
            <Logo size="lg" variant="icon" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-600">
            Easy Health 系統登陸
          </CardTitle>
          <CardDescription className="text-gray-600">
            請輸入登陸碼以訪問系統
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                登陸碼
              </label>
              <div className="relative">
                <Input
                  id="code"
                  type={showPassword ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="請輸入登陸碼"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="ripple-effect btn-micro-hover micro-brand-glow w-full bg-blue-600 hover:bg-blue-700"
            >
              登陸系統
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              如有登陸問題，請聯繫 Victor
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
