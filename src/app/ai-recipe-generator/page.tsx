'use client'

import { useState } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { AIRecipeRequest, AIRecipeResponse } from '@/types/v2-types'
import { Sparkles, Loader2, Copy, RefreshCw } from 'lucide-react'

export default function AIRecipeGeneratorPage() {
  const [formData, setFormData] = useState<AIRecipeRequest>({
    targetEffect: '',
    targetAudience: '一般成人',
    dosageForm: 'capsule',
    budget: '',
    enableReasoning: false
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<AIRecipeResponse['recipe'] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/recipe-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedRecipe(result.recipe)
      } else {
        setError(result.error || '配方生成失敗')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedRecipe?.content) {
      try {
        await navigator.clipboard.writeText(generatedRecipe.content)
        // 可以在這裡添加複製成功的提示
      } catch (err) {
        console.error('複製失敗:', err)
      }
    }
  }

  const handleRegenerate = () => {
    setGeneratedRecipe(null)
    handleSubmit(new Event('submit') as any)
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🤖 AI 配方生成器
            </h1>
            <p className="text-lg text-gray-600">
              使用人工智能技術，根據您的需求生成專業的膠囊配方
            </p>
          </div>

          {/* 表單區域 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
            <div className="liquid-glass-content">
              <div className="flex items-center space-x-3 mb-6">
                <div className="icon-container icon-container-blue">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">配方需求</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目標功效 *
                  </label>
                  <Input
                    value={formData.targetEffect}
                    onChange={(e) => setFormData({ ...formData, targetEffect: e.target.value })}
                    placeholder="例如：提升免疫力、改善睡眠、增強記憶力"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目標受眾
                    </label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="一般成人">一般成人</SelectItem>
                        <SelectItem value="中老年人">中老年人</SelectItem>
                        <SelectItem value="上班族">上班族</SelectItem>
                        <SelectItem value="學生">學生</SelectItem>
                        <SelectItem value="運動員">運動員</SelectItem>
                        <SelectItem value="孕婦">孕婦</SelectItem>
                        <SelectItem value="兒童">兒童</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      劑型
                    </label>
                    <Select
                      value={formData.dosageForm}
                      onValueChange={(value: any) => setFormData({ ...formData, dosageForm: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capsule">膠囊</SelectItem>
                        <SelectItem value="tablet">片劑</SelectItem>
                        <SelectItem value="powder">粉劑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    預算限制（可選）
                  </label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="例如：單粒成本不超過 HK$2.00"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableReasoning"
                    checked={formData.enableReasoning}
                    onChange={(e) => setFormData({ ...formData, enableReasoning: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="enableReasoning" className="text-sm text-gray-700">
                    啟用深度思考模式（回應時間較長但質量更高）
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating || !formData.targetEffect}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成配方
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* 錯誤提示 */}
          {error && (
            <Card className="liquid-glass-card liquid-glass-card-warning mb-8">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3">
                  <div className="icon-container icon-container-red">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* 生成中狀態 */}
          {isGenerating && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <div className="liquid-glass-content">
                <div className="text-center py-12">
                  <div className="icon-container icon-container-blue mx-auto mb-6">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🤖 AI 正在生成配方...
                  </h3>
                  <div className="space-y-3 text-gray-600">
                    <p>正在分析您的需求...</p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm">這可能需要 10-30 秒，請耐心等待...</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 生成結果 */}
          {generatedRecipe && !isGenerating && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <div className="liquid-glass-content">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="icon-container icon-container-green">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">生成的配方</h2>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-4 w-4" />
                      <span>複製</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>重新生成</span>
                    </Button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {generatedRecipe.content}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">配方 ID:</span>
                      <span className="ml-2 text-gray-800">{generatedRecipe.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">生成時間:</span>
                      <span className="ml-2 text-gray-800">
                        {new Date(generatedRecipe.createdAt).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">狀態:</span>
                      <span className="ml-2 text-green-600">已保存</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
