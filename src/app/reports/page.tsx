'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, Package, BarChart3, ArrowUpDown, ArrowUp, ArrowDown, Bot, RefreshCw } from 'lucide-react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import Link from 'next/link'

interface IngredientStat {
  materialName: string
  totalUsageMg: number
  usageCount: number
  weightPercentage: number
  riskLevel: string
  riskScore: number
  riskDescription: string
  riskReasons?: string[]
  recommendations?: string[]
  technicalNotes?: string
  isAIAssessed?: boolean
}

interface StatsSummary {
  totalIngredients: number
  highRiskIngredients: number
  mediumRiskIngredients: number
  lowRiskIngredients: number
}

interface IngredientStatsResponse {
  ingredients: IngredientStat[]
  totalWeight: number
  summary: StatsSummary
}

type SortField = 'materialName' | 'usageCount' | 'totalUsageMg'
type SortOrder = 'asc' | 'desc'

export default function ReportsPage() {
  const [stats, setStats] = useState<IngredientStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('totalUsageMg')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [aiAssessing, setAiAssessing] = useState(false)
  const [showAIAssessment, setShowAIAssessment] = useState(false) // 只有 AI 評估完成後才顯示
  const [hasAIAssessment, setHasAIAssessment] = useState(false) // 追蹤是否已完成 AI 評估

  useEffect(() => {
    fetchStats()
  }, [])

  // 當數據加載完成後，自動執行 AI 評估
  useEffect(() => {
    if (stats?.ingredients && stats.ingredients.length > 0 && !showAIAssessment) {
      assessRiskWithAI()
    }
  }, [stats])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ingredients/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
      
      // 數據加載完成後，自動執行 AI 評估
      if (data.ingredients && data.ingredients.length > 0) {
        setTimeout(() => {
          assessRiskWithAI(data.ingredients)
        }, 1000) // 延遲 1 秒後自動執行 AI 評估
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('載入統計數據失敗')
    } finally {
      setLoading(false)
    }
  }

  const assessRiskWithAI = async (ingredientsData?: IngredientStat[]) => {
    const ingredients = ingredientsData || stats?.ingredients
    if (!ingredients) return

    try {
      setAiAssessing(true)
      const materials = ingredients.map(ingredient => ingredient.materialName)
      
      const response = await fetch('/api/ai/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ materials })
      })

      if (!response.ok) throw new Error('AI 評估失敗')
      
      const aiData = await response.json()
      
      if (aiData.assessments) {
        // 更新統計數據，合併 AI 評估結果
        const updatedIngredients = ingredients.map(ingredient => {
          const aiAssessment = aiData.assessments.find((a: any) => 
            a.materialName === ingredient.materialName
          )
          
          if (aiAssessment) {
            return {
              ...ingredient,
              riskScore: aiAssessment.riskScore,
              riskLevel: aiAssessment.riskLevel,
              riskDescription: aiAssessment.riskReasons?.join(', ') || ingredient.riskDescription,
              riskReasons: aiAssessment.riskReasons,
              recommendations: aiAssessment.recommendations,
              technicalNotes: aiAssessment.technicalNotes,
              isAIAssessed: true
            }
          }
          return ingredient
        })

        // 重新計算摘要統計
        const updatedSummary = {
          totalIngredients: updatedIngredients.length,
          highRiskIngredients: updatedIngredients.filter(s => s.riskScore >= 7).length,
          mediumRiskIngredients: updatedIngredients.filter(s => s.riskScore >= 4 && s.riskScore < 7).length,
          lowRiskIngredients: updatedIngredients.filter(s => s.riskScore < 4).length
        }

        setStats(prevStats => ({
          ...prevStats!,
          ingredients: updatedIngredients,
          summary: updatedSummary
        }))
        
        setShowAIAssessment(true)
        setHasAIAssessment(true)
      }
    } catch (error) {
      console.error('AI 風險評估錯誤:', error)
      alert('AI 風險評估失敗，請稍後再試')
    } finally {
      setAiAssessing(false)
    }
  }

  const getRiskBadgeColor = (score: number) => {
    if (score >= 7) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getRiskLevelText = (score: number) => {
    if (score >= 7) return '高風險'
    if (score >= 4) return '中風險'
    return '低風險'
  }

  const formatWeight = (mg: number) => {
    if (mg >= 1000) {
      return `${(mg / 1000).toFixed(2)} g`
    }
    return `${mg.toFixed(2)} mg`
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const sortedIngredients = stats?.ingredients ? [...stats.ingredients].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'materialName':
        aValue = a.materialName
        bValue = b.materialName
        break
      case 'usageCount':
        aValue = a.usageCount
        bValue = b.usageCount
        break
      case 'totalUsageMg':
        aValue = a.totalUsageMg
        bValue = b.totalUsageMg
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  }) : []

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">載入統計數據中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      {/* Liquid Glass Navigation */}
        <LiquidGlassNav 
          links={[
            { href: '/', label: '首頁' },
            { href: '/orders', label: '訂單' },
            { href: '/orders/new', label: '新建' }
          ]}
        />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">


      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-interactive">
            <div className="liquid-glass-content">
              <div className="flex items-center space-x-3 mb-4">
                <div className="icon-container icon-container-blue">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-700">總原料種類</h3>
                  <p className="text-blue-600">已使用原料</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800">{stats.summary.totalIngredients}</p>
                <p className="text-sm text-blue-600">種不同原料</p>
              </div>
            </div>
          </div>

          {hasAIAssessment && (
            <>
              <div className="liquid-glass-card liquid-glass-card-interactive">
                <div className="liquid-glass-content">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="icon-container icon-container-red">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700">高風險原料</h3>
                      <p className="text-red-600">需要特別注意</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-800">{stats.summary.highRiskIngredients}</p>
                    <p className="text-sm text-red-600">種高風險原料</p>
                  </div>
                </div>
              </div>

              <div className="liquid-glass-card liquid-glass-card-interactive">
                <div className="liquid-glass-content">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="icon-container icon-container-yellow">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-700">中風險原料</h3>
                      <p className="text-yellow-600">需要標準處理</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-800">{stats.summary.mediumRiskIngredients}</p>
                    <p className="text-sm text-yellow-600">種中風險原料</p>
                  </div>
                </div>
              </div>

              <div className="liquid-glass-card liquid-glass-card-interactive">
                <div className="liquid-glass-content">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="icon-container icon-container-green">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-700">低風險原料</h3>
                      <p className="text-green-600">容易處理</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-800">{stats.summary.lowRiskIngredients}</p>
                    <p className="text-sm text-green-600">種低風險原料</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {!hasAIAssessment && (
            <div className="liquid-glass-card liquid-glass-card-interactive">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="icon-container icon-container-purple">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-700">AI 評估中</h3>
                    <p className="text-purple-600">正在進行專業分析</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-800">
                    {aiAssessing ? '分析中...' : '等待中'}
                  </p>
                  <p className="text-sm text-purple-600">
                    {aiAssessing ? 'AI 正在評估風險' : '即將開始 AI 評估'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ingredients Table */}
      {stats && stats.ingredients.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
                  原料使用詳情
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {hasAIAssessment 
                    ? 'AI 專業風險評估結果 - 基於原料特性、法規要求和行業標準的智能分析'
                    : '正在進行 AI 專業風險評估，請稍候...'
                  }
                </CardDescription>
              </div>
              <button
                onClick={() => assessRiskWithAI()}
                disabled={aiAssessing || !stats?.ingredients?.length}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {aiAssessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    AI 評估中...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    重新評估
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="text-sm font-semibold cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('materialName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>原料名稱</span>
                        {getSortIcon('materialName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-sm font-semibold cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('usageCount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>使用次數</span>
                        {getSortIcon('usageCount')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-sm font-semibold cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('totalUsageMg')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>總使用量</span>
                        {getSortIcon('totalUsageMg')}
                      </div>
                    </TableHead>
                    {hasAIAssessment && (
                      <TableHead className="text-sm font-semibold">
                        風險評估
                      </TableHead>
                    )}
                    {showAIAssessment && (
                      <TableHead className="text-sm font-semibold">
                        AI 分析詳情
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedIngredients.map((ingredient, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-800">
                        {ingredient.materialName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {ingredient.usageCount} 次
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatWeight(ingredient.totalUsageMg)}
                      </TableCell>
                      {hasAIAssessment && (
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge className={`${getRiskBadgeColor(ingredient.riskScore)} text-xs`}>
                              {getRiskLevelText(ingredient.riskScore)} ({ingredient.riskScore}/10)
                            </Badge>
                            {ingredient.isAIAssessed && (
                              <span className="text-xs text-blue-600 flex items-center">
                                <Bot className="h-3 w-3 mr-1" />
                                AI 評估
                              </span>
                            )}
                            <p className="text-xs text-gray-500 max-w-xs">
                              {ingredient.riskDescription}
                            </p>
                          </div>
                        </TableCell>
                      )}
                      {showAIAssessment && ingredient.isAIAssessed && (
                        <TableCell>
                          <div className="space-y-2 max-w-md">
                            {ingredient.riskReasons && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">風險原因:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {ingredient.riskReasons.map((reason, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-red-500 mr-1">•</span>
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {ingredient.recommendations && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">建議處理:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {ingredient.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-500 mr-1">•</span>
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats && stats.ingredients.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">暫無原料使用數據</p>
            <p className="text-sm text-gray-500 mt-2">請先創建一些生產記錄</p>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 公司信息 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Easy Health</h3>
              <p className="text-gray-400 text-sm mb-4">
                專業的保健品膠囊生產管理解決方案
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💊</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏭</span>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
            </div>

            {/* 主要功能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">主要功能</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/orders" className="hover:text-white transition-colors">訂單管理</Link></li>
                <li><Link href="/ai-recipe-generator" className="hover:text-white transition-colors">AI 配方生成</Link></li>
                <li><Link href="/work-orders" className="hover:text-white transition-colors">工作單生成</Link></li>
                <li><Link href="/reports" className="hover:text-white transition-colors">原料報表</Link></li>
              </ul>
            </div>

            {/* 系統功能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">系統功能</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/history" className="hover:text-white transition-colors">歷史記錄</Link></li>
                <li><Link href="/liquid-glass-demo" className="hover:text-white transition-colors">UI 演示</Link></li>
                <li><Link href="/orders/new" className="hover:text-white transition-colors">新建訂單</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">登入系統</Link></li>
              </ul>
            </div>

            {/* 技術支援 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">技術支援</h3>
              <div className="text-sm text-gray-400">
                <p className="mb-2">系統管理員：Victor</p>
                <p className="mb-2">版本：v2.0</p>
                <p className="mb-4">最後更新：2025年9月29日</p>
                <div className="flex space-x-2">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">在線</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">AI 驅動</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Easy Health 膠囊管理系統. 保留所有權利.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
