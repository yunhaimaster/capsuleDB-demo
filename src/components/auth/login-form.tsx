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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
            <Logo size="lg" variant="icon" className="text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Easy Health 系統登陸
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            請輸入登陸碼以訪問系統
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              登陸系統
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              如有登陸問題，請聯繫 Victor
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
