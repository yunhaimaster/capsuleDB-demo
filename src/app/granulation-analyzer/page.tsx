'use client'

import { useState } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { SmartRecipeImport } from '@/components/forms/smart-recipe-import'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface GranulationAnalysis {
  model: string
  modelId: string
  content: string
  timestamp: string
  status: 'loading' | 'success' | 'error'
  error?: string
}

interface Ingredient {
  materialName: string
  unitContentMg: number
  isCustomerProvided: boolean
}

export default function GranulationAnalyzerPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { materialName: '', unitContentMg: 0, isCustomerProvided: true }
  ])
  const [analyses, setAnalyses] = useState<GranulationAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const models = [
    { name: 'xAI Grok 4 Fast', id: 'x-ai/grok-4-fast' },
    { name: 'OpenAI GPT-4.1 Mini', id: 'openai/gpt-4.1-mini' },
    { name: 'DeepSeek v3.1', id: 'deepseek/deepseek-chat-v3.1' }
  ]

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
    setAnalyses([])

    // 初始化三個分析
    const initialAnalyses: GranulationAnalysis[] = models.map(model => ({
      model: model.name,
      modelId: model.id,
      content: '',
      timestamp: new Date().toISOString(),
      status: 'loading'
    }))
    setAnalyses(initialAnalyses)

    // 構建配方文字
    const recipeText = ingredients
      .filter(ing => ing.materialName)
      .map(ing => `${ing.materialName}: ${formatNumber(ing.unitContentMg)}mg`)
      .join('\n')

    // 調用 API 進行三模型分析
    try {
      const response = await fetch('/api/ai/granulation-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients.filter(ing => ing.materialName && ing.unitContentMg > 0)
        }),
      })

      if (!response.ok) {
        throw new Error(`API 請求失敗 (${response.status})`)
      }

      const data = await response.json()
      
      if (data.success && data.results) {
        // 更新所有分析結果
        setAnalyses(data.results.map((result: any, index: number) => ({
          model: result.model,
          modelId: models[index].id,
          content: result.response || '',
          status: result.error ? 'error' : 'success',
          error: result.error || undefined,
          timestamp: new Date().toISOString()
        })))
      } else {
        throw new Error(data.error || '分析失敗')
      }

    } catch (error) {
      console.error('製粒分析錯誤:', error)
      
      // 設置錯誤狀態
      setAnalyses(prev => prev.map(analysis => ({
        ...analysis,
        content: '',
        status: 'error' as const,
        error: error instanceof Error ? error.message : '分析失敗',
        timestamp: new Date().toISOString()
      })))
    }

    setIsAnalyzing(false)
  }

  const clearAnalysis = () => {
    setAnalyses([])
  }

  const retryAnalysis = async (modelIndex: number) => {
    const model = models[modelIndex]
    if (!model) return

    // 更新該模型的狀態為加載中
    setAnalyses(prev => prev.map((analysis, i) => 
      i === modelIndex 
        ? { ...analysis, status: 'loading', content: '', error: undefined }
        : analysis
    ))

    try {
      const response = await fetch('/api/ai/granulation-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients.filter(ing => ing.materialName && ing.unitContentMg > 0),
          singleModel: model.id // 只調用單個模型
        }),
      })

      if (!response.ok) {
        throw new Error(`API 請求失敗 (${response.status})`)
      }

      // 檢查是否是流式響應
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('text/event-stream')) {
        // 流式響應處理 - 使用與 Smart AI 相同的方法
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('event: delta') || line.startsWith('data: ')) {
                try {
                  let data = ''
                  if (line.startsWith('event: delta')) {
                    // 找到對應的 data 行
                    const dataIndex = lines.indexOf(line) + 1
                    if (dataIndex < lines.length && lines[dataIndex].startsWith('data: ')) {
                      data = lines[dataIndex].slice(6)
                    }
                  } else if (line.startsWith('data: ')) {
                    data = line.slice(6)
                  }

                  if (data && data !== '{}') {
                    const content = JSON.parse(data)
                    if (typeof content === 'string') {
                      // 逐步更新內容，實現打字機效果
                      setAnalyses(prev => prev.map((analysis, i) => 
                        i === modelIndex 
                          ? {
                              ...analysis,
                              content: analysis.content + content,
                              status: 'success' as const,
                              timestamp: new Date().toISOString()
                            }
                          : analysis
                      ))
                    }
                  }
                } catch (e) {
                  // 忽略解析錯誤
                }
              } else if (line.startsWith('event: done')) {
                // 流式輸出完成
                break
              } else if (line.startsWith('event: error')) {
                // 處理錯誤
                throw new Error('流式輸出過程中發生錯誤')
              }
            }
          }
        }
      } else {
        // 非流式響應處理（原有的邏輯）
        const data = await response.json()
        
        if (data.success && data.results && data.results.length > 0) {
          const result = data.results[0]
          // 更新該模型的結果
          setAnalyses(prev => prev.map((analysis, i) => 
            i === modelIndex 
              ? {
                  ...analysis,
                  content: result.response || '',
                  status: result.error ? 'error' : 'success',
                  error: result.error || undefined,
                  timestamp: new Date().toISOString()
                }
              : analysis
          ))
        } else {
          throw new Error(data.error || '分析失敗')
        }
      }

    } catch (error) {
      console.error(`${model.name} 重試錯誤:`, error)
      
      // 設置錯誤狀態
      setAnalyses(prev => prev.map((analysis, i) => 
        i === modelIndex 
          ? {
              ...analysis,
              content: '',
              status: 'error' as const,
              error: error instanceof Error ? error.message : '分析失敗',
              timestamp: new Date().toISOString()
            }
          : analysis
      ))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen logo-bg-animation flex flex-col">
      <LiquidGlassNav />
      
      <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 頁面標題 */}
          <div className="text-center space-y-4 mt-16">
            <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-300/40 text-emerald-700 text-sm">
              <Brain className="h-4 w-4" />
              <span className="font-medium tracking-wide">AI 輔助工具</span>
            </div>
            <h1 className="text-2xl md:text-xl font-semibold text-gray-800">
              多模型製粒分析
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              使用三個不同的 AI 模型同時分析配方是否需要製粒，提供多角度專業見解
            </p>
          </div>

          {/* 配方輸入區域 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
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
                    onClick={() => setIngredients([...ingredients, { materialName: '', unitContentMg: 0, isCustomerProvided: true }])}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    + 添加原料
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* 分析按鈕 */}
          <div className="text-center">
            <Button
              onClick={analyzeGranulation}
              disabled={isAnalyzing || ingredients.length === 0 || ingredients[0].materialName === ''}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  三模型分析中...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  開始製粒分析
                </>
              )}
            </Button>
          </div>

          {/* 分析結果 */}
          {analyses.length > 0 && (
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {analyses.map((analysis, index) => (
                  <Card key={index} className="liquid-glass-card liquid-glass-card-elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{analysis.model}</CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(analysis.status)}
                          <Badge className={getStatusColor(analysis.status)}>
                            {analysis.status === 'loading' ? '分析中' : 
                             analysis.status === 'success' ? '完成' : '錯誤'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {analysis.status === 'loading' && (
                        <div className="space-y-3">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          </div>
                          <p className="text-sm text-gray-500">AI 正在分析中...</p>
                        </div>
                      )}
                      
                      {analysis.status === 'success' && (
                        <div className="space-y-3">
                          <div className="text-sm leading-relaxed">
                            <MarkdownRenderer content={analysis.content} />
                            {analysis.content && analysis.content.length > 0 && (
                              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            分析時間: {new Date(analysis.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {analysis.status === 'error' && (
                        <div className="space-y-3">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {analysis.error || '分析過程中發生錯誤'}
                            </AlertDescription>
                          </Alert>
                          <div className="text-center">
                            <Button
                              onClick={() => retryAnalysis(index)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
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
