'use client'

import { useState, useEffect } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { 
  Database, 
  Trash2, 
  Eye, 
  Calendar, 
  Star, 
  Shield, 
  DollarSign,
  Loader2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface AIRecipe {
  id: string
  name: string
  description: string | null
  targetEffect: string
  targetAudience: string | null
  dosageForm: string
  efficacyScore: number | null
  safetyScore: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AIRecipesPage() {
  const [recipes, setRecipes] = useState<AIRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')

  // 檢查數據庫狀態
  const checkDbStatus = async () => {
    setDbStatus('checking')
    try {
      const response = await fetch('/api/ai/recipes?limit=1')
      const data = await response.json()
      setDbStatus(data.success && data.hasTable ? 'connected' : 'disconnected')
    } catch (error) {
      setDbStatus('disconnected')
    }
  }

  // 獲取配方列表
  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/recipes')
      const data = await response.json()
      if (data.success) {
        setRecipes(data.recipes || [])
      }
    } catch (error) {
      console.error('獲取配方列表失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 刪除配方
  const deleteRecipe = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch('/api/ai/recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      const data = await response.json()
      if (data.success) {
        setRecipes(recipes.filter(recipe => recipe.id !== id))
      } else {
        alert('刪除失敗：' + data.error)
      }
    } catch (error) {
      console.error('刪除配方失敗:', error)
      alert('刪除失敗')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    checkDbStatus()
    fetchRecipes()
  }, [])

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📚 AI 配方庫
            </h1>
            <p className="text-lg text-gray-600">
              查看和管理已保存的 AI 生成配方
            </p>
          </div>

          {/* 數據庫狀態指示器 */}
          <div className="mb-6 flex items-center justify-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              dbStatus === 'checking' ? 'bg-yellow-100 text-yellow-800' :
              dbStatus === 'connected' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                dbStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                dbStatus === 'connected' ? 'bg-green-500' :
                'bg-red-500'
              }`}></div>
              {dbStatus === 'checking' && '檢查數據庫狀態...'}
              {dbStatus === 'connected' && '數據庫已連接'}
              {dbStatus === 'disconnected' && '數據庫未設置'}
            </div>
            
            {/* 刷新按鈕 */}
            <button
              onClick={() => {
                checkDbStatus()
                fetchRecipes()
              }}
              className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              disabled={dbStatus === 'checking'}
            >
              {dbStatus === 'checking' ? '檢查中...' : '刷新'}
            </button>
          </div>

          {/* 數據庫未設置提示 */}
          {dbStatus === 'disconnected' && (
            <Card className="liquid-glass-card liquid-glass-card-warning mb-8">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="icon-container icon-container-orange">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-orange-800">數據庫未設置</h3>
                </div>
                <p className="text-orange-700 mb-4">
                  數據庫尚未設置，無法顯示已保存的配方。請先設置數據庫。
                </p>
                <Link href="/setup">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    前往設置數據庫
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* 配方列表 */}
          {dbStatus === 'connected' && (
            <>
              {/* 統計信息 */}
              <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
                <div className="liquid-glass-content">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="icon-container icon-container-blue">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">配方統計</h3>
                        <p className="text-sm text-gray-600">
                          共 {recipes.length} 個已保存的配方
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={fetchRecipes}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        刷新
                      </Button>
                      <Link href="/ai-recipe-generator">
                        <Button size="sm">
                          生成新配方
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 配方卡片列表 */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">載入配方中...</span>
                </div>
              ) : recipes.length === 0 ? (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content text-center py-12">
                    <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">暫無保存的配方</h3>
                    <p className="text-gray-600 mb-6">
                      您還沒有保存任何 AI 生成的配方。開始生成您的第一個配方吧！
                    </p>
                    <Link href="/ai-recipe-generator">
                      <Button size="lg">
                        生成新配方
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recipes.map((recipe) => (
                    <Card key={recipe.id} className="liquid-glass-card liquid-glass-card-elevated">
                      <div className="liquid-glass-content">
                        {/* 配方標題和狀態 */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              {recipe.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {recipe.targetEffect}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => deleteRecipe(recipe.id)}
                              disabled={deleting === recipe.id}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleting === recipe.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* 配方描述 */}
                        {recipe.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {recipe.description}
                            </p>
                          </div>
                        )}

                        {/* 評分信息 */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {recipe.efficacyScore && (
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">功效評分</span>
                              <span className="text-sm font-medium text-gray-800">
                                {recipe.efficacyScore.toFixed(1)}/10
                              </span>
                            </div>
                          )}
                          {recipe.safetyScore && (
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">安全評分</span>
                              <span className="text-sm font-medium text-gray-800">
                                {recipe.safetyScore.toFixed(1)}/10
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 基本信息 */}
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">目標受眾：</span>
                            <span>{recipe.targetAudience || '一般成人'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">劑型：</span>
                            <span>{recipe.dosageForm}</span>
                          </div>
                        </div>

                        {/* 時間信息 */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>創建於 {new Date(recipe.createdAt).toLocaleDateString('zh-TW')}</span>
                          </div>
                          <Link href={`/ai-recipes/${recipe.id}`}>
                            <div className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 cursor-pointer">
                              <Eye className="h-3 w-3" />
                              <span>查看詳情</span>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 返回按鈕 */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline">
                返回首頁
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
