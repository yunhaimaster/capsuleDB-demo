'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  Calendar, 
  User, 
  Pill,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface AIRecipeDetail {
  id: string
  name: string
  description: string | null
  targetEffect: string
  targetAudience: string | null
  dosageForm: string
  ingredients: string
  dosage: string
  efficacyScore: number | null
  safetyScore: number | null
  costAnalysis: string | null
  regulatoryStatus: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AIRecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<AIRecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 獲取配方詳情
  const fetchRecipe = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/ai/recipes/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setRecipe(data.recipe)
      } else {
        setError(data.error || '獲取配方詳情失敗')
      }
    } catch (error) {
      console.error('獲取配方詳情失敗:', error)
      setError('獲取配方詳情失敗')
    } finally {
      setLoading(false)
    }
  }

  // 刪除配方
  const deleteRecipe = async () => {
    if (!confirm('確定要刪除這個配方嗎？此操作無法撤銷。')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/ai/recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: params.id }),
      })
      
      const data = await response.json()
      if (data.success) {
        router.push('/ai-recipes')
      } else {
        alert('刪除失敗：' + data.error)
      }
    } catch (error) {
      console.error('刪除配方失敗:', error)
      alert('刪除失敗')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchRecipe()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen brand-logo-pattern-bg">
        <LiquidGlassNav />
        <div className="container mx-auto px-4 pt-28 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">載入配方詳情中...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen brand-logo-pattern-bg">
        <LiquidGlassNav />
        <div className="container mx-auto px-4 pt-28 pb-8">
          <div className="max-w-4xl mx-auto">
            <Card className="liquid-glass-card liquid-glass-card-warning">
              <div className="liquid-glass-content text-center py-12">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-800 mb-2">載入失敗</h3>
                <p className="text-red-700 mb-6">
                  {error || '配方不存在或已被刪除'}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={fetchRecipe} variant="outline">
                    重試
                  </Button>
                  <Link href="/ai-recipes">
                    <Button>
                      返回配方庫
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按鈕 */}
          <div className="mb-6">
            <Link href="/ai-recipes">
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>返回配方庫</span>
              </Button>
            </Link>
          </div>

          {/* 配方標題和狀態 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
            <div className="liquid-glass-content">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {recipe.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {recipe.targetEffect}
                  </p>
                  {recipe.description && (
                    <p className="text-gray-700 mb-4">
                      {recipe.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={deleteRecipe}
                    disabled={deleting}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 評分信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {recipe.efficacyScore && (
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-gray-800">功效評分</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {recipe.efficacyScore.toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                )}
                {recipe.safetyScore && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                    <Shield className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-gray-800">安全評分</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {recipe.safetyScore.toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">目標受眾：</span>
                  <span>{recipe.targetAudience || '一般成人'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Pill className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">劑型：</span>
                  <span>{recipe.dosageForm}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">創建時間：</span>
                  <span>{new Date(recipe.createdAt).toLocaleDateString('zh-TW')}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI生成的完整配方內容 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
            <div className="liquid-glass-content">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                AI生成的完整配方
              </h2>
              <div className="prose max-w-none">
                <MarkdownRenderer content={recipe.ingredients} />
              </div>
            </div>
          </Card>

          {/* AI免責聲明 */}
          <AIDisclaimer type="recipe" />

          {/* 操作按鈕 */}
          <div className="flex justify-center space-x-4 mt-8">
            <Link href="/ai-recipes">
              <Button variant="outline">
                返回配方庫
              </Button>
            </Link>
            <Link href="/ai-recipe-generator">
              <Button>
                生成新配方
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <LiquidGlassFooter />
    </div>
  )
}
