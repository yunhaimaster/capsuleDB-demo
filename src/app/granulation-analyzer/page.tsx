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

interface GranulationAnalysis {
  model: string
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
    { name: 'Google Gemini 2.5 Flash', id: 'google/gemini-2.5-flash' },
    { name: 'OpenAI GPT-4o Mini', id: 'openai/gpt-4o-mini' },
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

    // 同時調用三個模型
    const promises = models.map(async (model, index) => {
      try {
        const response = await fetch('/api/ai/granulation-analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe: recipeText,
            model: model.id
          }),
        })

        if (!response.ok) {
          throw new Error(`API 請求失敗 (${response.status})`)
        }

        const data = await response.json()
        
        // 更新對應的分析結果
        setAnalyses(prev => prev.map((analysis, i) => 
          i === index 
            ? {
                ...analysis,
                content: data.content || data.message || '分析完成',
                status: 'success' as const,
                timestamp: new Date().toISOString()
              }
            : analysis
        ))

      } catch (error) {
        console.error(`${model.name} 分析錯誤:`, error)
        
        // 更新錯誤狀態
        setAnalyses(prev => prev.map((analysis, i) => 
          i === index 
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
    })

    // 等待所有分析完成
    await Promise.allSettled(promises)
    setIsAnalyzing(false)
  }

  const clearAnalysis = () => {
    setAnalyses([])
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
    <div className="min-h-screen brand-logo-bg-animation flex flex-col">
      <LiquidGlassNav />
      
      <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 頁面標題 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center gap-3 px-4 py-2 rounded-full bg-white/70 border border-white/60 text-[--brand-neutral] text-sm">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium tracking-wide">製粒必要性分析工具</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              多模型製粒分析
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              使用三個不同的 AI 模型同時分析配方是否需要製粒，提供多角度專業見解
            </p>
          </div>

          {/* 配方輸入區域 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                配方輸入
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <SmartRecipeImport onImport={handleSmartImport} />
                <Badge variant="outline" className="text-xs">
                  智能導入支援文字和圖片
                </Badge>
              </div>
              
              <ProductionOrderForm 
                initialData={{
                  ingredients: ingredients,
                  customerName: '',
                  productName: '',
                  productionQuantity: 0,
                  unitWeightMg: 0,
                  batchTotalWeightMg: 0,
                  capsuleSize: '#0',
                  capsuleMaterial: 'gelatin',
                  capsuleColor: '',
                  remarks: '',
                  processIssues: '',
                  qualityNotes: '',
                  createdBy: '',
                  completionDate: undefined,
                  isCustomerProvided: true
                }}
                orderId={null}
              />
            </CardContent>
          </Card>

          {/* 分析按鈕 */}
          <div className="text-center">
            <Button
              onClick={analyzeGranulation}
              disabled={isAnalyzing || ingredients.length === 0 || ingredients[0].materialName === ''}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">分析結果</h2>
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
                        <CardTitle className="text-lg">{analysis.model}</CardTitle>
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
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {analysis.content}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            分析時間: {new Date(analysis.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {analysis.status === 'error' && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {analysis.error || '分析過程中發生錯誤'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <LiquidGlassFooter />
    </div>
  )
}
