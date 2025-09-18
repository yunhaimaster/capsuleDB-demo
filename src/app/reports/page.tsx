'use client'

import { useState, useEffect } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, Package, BarChart3 } from 'lucide-react'

interface IngredientStat {
  materialName: string
  totalUsageMg: number
  usageCount: number
  weightPercentage: number
  riskLevel: string
  riskScore: number
  riskDescription: string
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

export default function ReportsPage() {
  const [stats, setStats] = useState<IngredientStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ingredients/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('載入統計數據失敗')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={[{ label: '統計報表' }]} />
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">載入統計數據中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <Breadcrumb items={[{ label: '統計報表' }]} />
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: '統計報表' }]} />

      {/* Header Section */}
      <div className="text-center space-y-3 md:space-y-4 py-4 md:py-6">
        <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-3 md:mb-4">
          <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          原料使用統計
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          分析所有原料的使用情況、重量佔比和灌裝難度風險指數
        </p>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-blue-700">總原料種類</CardTitle>
                  <CardDescription className="text-blue-600">已使用原料</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-800">{stats.summary.totalIngredients}</p>
              <p className="text-sm text-blue-600">種不同原料</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-red-700">高風險原料</CardTitle>
                  <CardDescription className="text-red-600">需要特別注意</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-800">{stats.summary.highRiskIngredients}</p>
              <p className="text-sm text-red-600">種高風險原料</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-yellow-700">中風險原料</CardTitle>
                  <CardDescription className="text-yellow-600">需要標準處理</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-800">{stats.summary.mediumRiskIngredients}</p>
              <p className="text-sm text-yellow-600">種中風險原料</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-green-700">低風險原料</CardTitle>
                  <CardDescription className="text-green-600">容易處理</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-800">{stats.summary.lowRiskIngredients}</p>
              <p className="text-sm text-green-600">種低風險原料</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ingredients Table */}
      {stats && stats.ingredients.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-amber-600" />
              原料使用詳情
            </CardTitle>
            <CardDescription className="text-gray-600">
              按使用量排序，顯示重量佔比和風險評估
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm font-semibold">原料名稱</TableHead>
                    <TableHead className="text-sm font-semibold">使用次數</TableHead>
                    <TableHead className="text-sm font-semibold">總使用量</TableHead>
                    <TableHead className="text-sm font-semibold">重量佔比</TableHead>
                    <TableHead className="text-sm font-semibold">風險等級</TableHead>
                    <TableHead className="text-sm font-semibold">風險描述</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.ingredients.map((ingredient, index) => (
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
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <span>{ingredient.weightPercentage}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(ingredient.weightPercentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getRiskBadgeColor(ingredient.riskScore)}`}>
                          {getRiskLevelText(ingredient.riskScore)} ({ingredient.riskScore}/10)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs">
                        {ingredient.riskDescription}
                      </TableCell>
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
    </div>
  )
}
