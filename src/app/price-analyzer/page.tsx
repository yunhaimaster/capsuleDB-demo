'use client'

import { useState } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { PriceAnalysisRequest, PriceAnalysisResponse, PriceData } from '@/types/v2-types'
import { TrendingUp, Loader2, Search, DollarSign, Calendar, Package } from 'lucide-react'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'

export default function PriceAnalyzerPage() {
  const [formData, setFormData] = useState<PriceAnalysisRequest>({
    materialName: '',
    analysisType: 'comprehensive',
    enableReasoning: false
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PriceAnalysisResponse['analysis'] | null>(null)
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/price-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result.analysis)
        setPriceData(result.analysis.priceData || [])
      } else {
        setError(result.error || '價格分析失敗')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSearchPriceData = async () => {
    if (!formData.materialName) return

    try {
      const response = await fetch(`/api/ai/price-analysis?materialName=${encodeURIComponent(formData.materialName)}`)
      const result = await response.json()

      if (result.success) {
        setPriceData(result.data.priceData)
      }
    } catch (err) {
      console.error('獲取價格數據失敗:', err)
    }
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              💰 原料價格分析器
            </h1>
            <p className="text-lg text-gray-600">
              智能分析原料價格趨勢，提供專業的採購建議和成本預測
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側：分析表單 */}
            <div className="lg:col-span-1">
              <Card className="liquid-glass-card liquid-glass-card-elevated mb-6">
                <div className="liquid-glass-content">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="icon-container icon-container-green">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">價格分析</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        原料名稱 *
                      </label>
                      <Input
                        value={formData.materialName}
                        onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                        placeholder="例如：維生素C、魚油、鈣片"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分析類型
                      </label>
                      <select
                        value={formData.analysisType}
                        onChange={(e) => setFormData({ ...formData, analysisType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="comprehensive">綜合分析</option>
                        <option value="trend">價格趨勢</option>
                        <option value="supplier">供應商比較</option>
                        <option value="cost">成本分析</option>
                      </select>
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
                        啟用深度分析模式
                      </label>
                    </div>

                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isAnalyzing || !formData.materialName}
                        className="w-full"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            分析中...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            開始分析
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSearchPriceData}
                        disabled={!formData.materialName}
                        className="w-full"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        查看歷史數據
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>

              {/* 歷史價格數據 */}
              {priceData.length > 0 && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="icon-container icon-container-blue">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">歷史價格數據</h3>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {priceData.slice(0, 5).map((price, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{price.supplier}</span>
                            <span className="text-green-600 font-bold">
                              HK${price.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>質量等級: {price.quality}</div>
                            <div>單位: {price.unit}</div>
                            <div>日期: {new Date(price.createdAt).toLocaleDateString('zh-TW')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* 右側：分析結果 */}
            <div className="lg:col-span-2">
              {/* 錯誤提示 */}
              {error && (
                <Card className="liquid-glass-card liquid-glass-card-warning mb-6">
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

              {/* 分析中狀態 */}
              {isAnalyzing && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="text-center py-12">
                      <div className="icon-container icon-container-green mx-auto mb-6">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        💰 AI 正在分析價格...
                      </h3>
                      <div className="space-y-3 text-gray-600">
                        <p>正在收集市場數據...</p>
                        <div className="flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <p className="text-sm">這可能需要 15-45 秒，請耐心等待...</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 分析結果 */}
              {analysisResult && !isAnalyzing && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="icon-container icon-container-green">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">分析結果</h2>
                    </div>

                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {analysisResult.content}
                      </div>
                    </div>

                    {/* 免責條款 */}
                    <div className="mt-6">
                      <AIDisclaimer type="analysis" />
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">分析對象:</span>
                          <span className="ml-2 text-gray-800">{analysisResult.materialName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">分析時間:</span>
                          <span className="ml-2 text-gray-800">
                            {new Date(analysisResult.generatedAt).toLocaleString('zh-TW')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">數據點:</span>
                          <span className="ml-2 text-gray-800">{analysisResult.priceData.length} 條記錄</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 使用說明 */}
              {!analysisResult && !error && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="text-center py-12">
                      <div className="icon-container icon-container-gray mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        開始價格分析
                      </h3>
                      <p className="text-gray-600 mb-6">
                        輸入原料名稱，獲取專業的價格分析和採購建議
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>價格趨勢分析</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>供應商比較</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>採購建議</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
