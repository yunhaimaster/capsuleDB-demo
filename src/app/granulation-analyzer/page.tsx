'use client'

import { useMemo, useRef, useState } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { SmartRecipeImport } from '@/components/forms/smart-recipe-import'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Loader2, AlertCircle, RefreshCw, Copy, Repeat2, Clock, PauseCircle, Sparkles, TriangleAlert } from 'lucide-react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface Ingredient {
  materialName: string
  unitContentMg: number
  isCustomerProvided: boolean
}

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

interface GranulationAnalysis {
  modelId: string
  modelName: string
  content: string
  status: AnalysisStatus
  error?: string
  startedAt?: number
  finishedAt?: number
}

interface ModelConfig {
  id: string
  name: string
  badgeClass: string
  iconClass: string
  description: string
}

const MODEL_CONFIG: ModelConfig[] = [
  {
    id: 'x-ai/grok-4-fast',
    name: 'xAI Grok 4 Fast',
    badgeClass: 'badge-grok',
    iconClass: 'icon-container-emerald',
    description: '優先提供整體風險概觀與敏感原料提示'
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'OpenAI GPT-4.1 Mini',
    badgeClass: 'badge-gpt',
    iconClass: 'icon-container-violet',
    description: '擅長結構化評分與合規審視'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek v3.1',
    badgeClass: 'badge-deepseek',
    iconClass: 'icon-container-blue',
    description: '深入分析流動性參數與改善方案'
  }
]

const formatDuration = (startedAt?: number, finishedAt?: number) => {
  if (!startedAt) return null
  const end = finishedAt || Date.now()
  const seconds = Math.max(0, Math.round((end - startedAt) / 100) / 10)
  return `${seconds.toFixed(1)} 秒`
}

export default function GranulationAnalyzerPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { materialName: '', unitContentMg: 0, isCustomerProvided: true }
  ])
  const [analyses, setAnalyses] = useState<Record<string, GranulationAnalysis>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const controllerRef = useRef<AbortController | null>(null)

  const handleSmartImport = (importedIngredients: any[]) => {
    try {
      const newIngredients = importedIngredients.length > 0
        ? importedIngredients
            .map((ing) => ({
              materialName: String(ing.materialName || '').trim(),
              unitContentMg: Number(ing.unitContentMg) || 0,
              isCustomerProvided: true
            }))
            .filter((item) => item.materialName !== '')
        : [{ materialName: '', unitContentMg: 0, isCustomerProvided: true }]

      setIngredients(newIngredients)
    } catch (error) {
      console.error('導入原料時發生錯誤:', error)
      alert(`導入失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  const analyzeGranulation = async () => {
    if (ingredients.length === 0 || ingredients[0].materialName === '') {
      alert('請先輸入原料配方')
      return
    }

    setIsAnalyzing(true)
    setHasRequested(true)
    setGlobalError(null)
    setAnalyses(
      MODEL_CONFIG.reduce<Record<string, GranulationAnalysis>>((acc, model) => {
        acc[model.id] = {
          modelId: model.id,
          modelName: model.name,
          content: '',
          status: 'loading',
          startedAt: Date.now()
        }
        return acc
      }, {})
    )

    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const response = await fetch('/api/ai/granulation-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: ingredients.filter((ing) => ing.materialName && ing.unitContentMg > 0)
        }),
        signal: controller.signal
      })

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        throw new Error(errorText || `API 請求失敗 (${response.status})`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const block of events) {
          if (!block.trim()) continue

          const [eventLine, dataLine] = block.split('\n')
          if (!eventLine || !dataLine) continue

          const eventName = eventLine.replace('event: ', '').trim()
          const data = dataLine.replace('data: ', '')

          try {
            const payload = JSON.parse(data)
            const modelId = payload.modelId as string | undefined
            if (!modelId) continue

            if (eventName === 'start') {
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: {
                  modelId,
                  modelName: payload.modelName || MODEL_CONFIG.find((m) => m.id === modelId)?.name || modelId,
                  content: '',
                  status: 'loading',
                  startedAt: Date.now()
                }
              }))
            } else if (eventName === 'delta') {
              const delta = payload.delta as string
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: prev[modelId]
                  ? {
                      ...prev[modelId],
                      content: prev[modelId].content + delta,
                      status: 'loading'
                    }
                  : {
                      modelId,
                      modelName: MODEL_CONFIG.find((m) => m.id === modelId)?.name || modelId,
                      content: delta,
                      status: 'loading',
                      startedAt: Date.now()
                    }
              }))
            } else if (eventName === 'error') {
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: {
                  ...prev[modelId],
                  status: 'error',
                  error: payload.error || '分析失敗',
                  finishedAt: Date.now()
                }
              }))
            } else if (eventName === 'done') {
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: {
                  ...prev[modelId],
                  status: prev[modelId]?.status === 'error' ? 'error' : 'success',
                  finishedAt: Date.now()
                }
              }))
            }
          } catch (error) {
            console.error('解析流式資料錯誤:', error)
          }
        }
      }
    } catch (error) {
      console.error('製粒分析錯誤:', error)
      setGlobalError(error instanceof Error ? error.message : '分析失敗，請稍後再試')
      setAnalyses({})
    }

    setIsAnalyzing(false)
  }

  const clearAnalysis = () => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setAnalyses({})
    setGlobalError(null)
  }

  const handleModelRetry = async (modelId: string) => {
    setAnalyses((prev) => ({
      ...prev,
      [modelId]: {
        modelId,
        modelName: MODEL_CONFIG.find((m) => m.id === modelId)?.name || modelId,
        content: '',
        status: 'loading',
        startedAt: Date.now()
      }
    }))

    try {
      const response = await fetch('/api/ai/granulation-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: ingredients.filter((ing) => ing.materialName && ing.unitContentMg > 0),
          singleModel: modelId
        })
      })

      if (!response.ok || !response.body) {
        const errorText = await response.text()
        throw new Error(errorText || `API 請求失敗 (${response.status})`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const block of events) {
          if (!block.trim()) continue

          const [eventLine, dataLine] = block.split('\n')
          if (!eventLine || !dataLine) continue

          const eventName = eventLine.replace('event: ', '').trim()
          const data = dataLine.replace('data: ', '')

          try {
            const payload = JSON.parse(data)
            if (payload.modelId !== modelId) continue

            if (eventName === 'delta') {
              const delta = payload.delta as string
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: {
                  ...prev[modelId],
                  content: (prev[modelId]?.content || '') + delta,
                  status: 'loading'
                }
              }))
            } else if (eventName === 'error') {
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: {
                  ...prev[modelId],
                  status: 'error',
                  error: payload.error || '分析失敗',
                  finishedAt: Date.now()
                }
              }))
            } else if (eventName === 'done') {
              setAnalyses((prev) => ({
                ...prev,
                [modelId]: {
                  ...prev[modelId],
                  status: prev[modelId]?.status === 'error' ? 'error' : 'success',
                  finishedAt: Date.now()
                }
              }))
            }
          } catch (error) {
            console.error('重試解析錯誤:', error)
          }
        }
      }
    } catch (error) {
      setAnalyses((prev) => ({
        ...prev,
        [modelId]: {
          ...prev[modelId],
          status: 'error',
          error: error instanceof Error ? error.message : '分析失敗',
          finishedAt: Date.now()
        }
      }))
    }
  }

  const handleCopy = async (modelId: string) => {
    const content = analyses[modelId]?.content
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
    } catch (error) {
      console.error('複製失敗:', error)
    }
  }

  const sortedAnalyses = useMemo(() => {
    return MODEL_CONFIG.map((model) => ({
      config: model,
      analysis: analyses[model.id] || {
        modelId: model.id,
        modelName: model.name,
        content: '',
        status: hasRequested ? 'loading' : 'idle'
      }
    }))
  }, [analyses, hasRequested])

  const isAnyLoading = sortedAnalyses.some((item) => item.analysis.status === 'loading')

  return (
    <div className="min-h-screen logo-bg-animation flex flex-col">
      <LiquidGlassNav />
      
      <main className="flex-1">
        <div className="pt-24 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined pb-8">
          {/* 頁面標題 */}
          <div className="text-center mb-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 border border-blue-300/40 text-xs font-medium text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              AI 製粒工具
            </div>
            <h1 className="text-2xl md:text-xl font-semibold text-gray-800">
              多模型製粒分析
            </h1>
            <p className="text-sm md:text-sm text-gray-600 max-w-2xl mx-auto">
              使用三個不同的 AI 模型同時分析配方是否需要製粒，提供多角度專業見解
            </p>
          </div>
          
          {/* 配方輸入區域 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated">
            <div className="liquid-glass-content">
              <div className="flex items-center space-x-3 mb-6">
                <div className="icon-container icon-container-emerald">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">配方輸入</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2 mb-4">
                  <SmartRecipeImport onImport={handleSmartImport} />
                  <Badge variant="outline" className="text-xs">
                    智能導入支援文字和圖片
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3 items-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          原料名稱
                        </label>
                        <input
                          type="text"
                          value={ingredient.materialName}
                          onChange={(e) => {
                            const newIngredients = [...ingredients]
                            newIngredients[index] = { ...ingredient, materialName: e.target.value }
                            setIngredients(newIngredients)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="輸入原料名稱"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          單粒重量 (mg)
                        </label>
                        <input
                          type="number"
                          value={ingredient.unitContentMg || ''}
                          onChange={(e) => {
                            const newIngredients = [...ingredients]
                            newIngredients[index] = { ...ingredient, unitContentMg: Number(e.target.value) || 0 }
                            setIngredients(newIngredients)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="輸入重量"
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => {
                            if (ingredients.length > 1) {
                              const newIngredients = ingredients.filter((_, i) => i !== index)
                              setIngredients(newIngredients)
                            }
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                          disabled={ingredients.length === 1}
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={analyzeGranulation}
                    disabled={isAnalyzing || ingredients.length === 0 || ingredients[0].materialName === ''}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        三模型分析中...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        開始製粒分析
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* 分析結果 */}
          {sortedAnalyses.length > 0 && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="icon-container icon-container-emerald">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">分析結果</h2>
                </div>
                <div className="space-y-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAnalysis}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    清除結果
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {sortedAnalyses.map((item) => (
                  <Card key={item.config.id} className="liquid-glass-card liquid-glass-card-elevated h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${item.config.badgeClass}`}>
                          {item.config.name}
                        </Badge>
                        <p className="text-sm text-gray-600">{item.config.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.analysis.status === 'loading' && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        )}
                        {item.analysis.status === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {item.analysis.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge className={getStatusColor(item.analysis.status)}>
                          {item.analysis.status === 'loading' ? '分析中' : 
                           item.analysis.status === 'success' ? '完成' : '錯誤'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex-1 p-4">
                      {item.analysis.status === 'loading' && (
                        <div className="space-y-3">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          </div>
                          <p className="text-sm text-gray-500">AI 正在分析中...</p>
                        </div>
                      )}
                      
                      {item.analysis.status === 'success' && (
                        <div className="space-y-3">
                          <div className="text-sm leading-relaxed">
                            <MarkdownRenderer content={item.analysis.content} />
                            {item.analysis.content && item.analysis.content.length > 0 && (
                              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            分析時間: {new Date(item.analysis.timestamp || item.analysis.startedAt!).toLocaleString()}
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(item.config.id)}
                              className="text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-100"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              複製結果
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleModelRetry(item.config.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Repeat2 className="h-4 w-4 mr-1" />
                              重試分析
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {item.analysis.status === 'error' && (
                        <div className="space-y-3">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {item.analysis.error || '分析過程中發生錯誤'}
                            </AlertDescription>
                          </Alert>
                          <div className="text-center">
                            <Button
                              onClick={() => handleModelRetry(item.config.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Repeat2 className="h-4 w-4 mr-2" />
                              重試分析
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
            </Card>
        )}
        </div>
      </main>

      <LiquidGlassFooter />
    </div>
  )
}
