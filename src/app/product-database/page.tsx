'use client'

import { useState, useEffect } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ProductDatabaseItem } from '@/types/v2-types'
import { Database, Search, Plus, Eye, Edit, Trash2, Filter, Download, Upload, Brain, BarChart3, Loader2 } from 'lucide-react'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

export default function ProductDatabasePage() {
  const [products, setProducts] = useState<ProductDatabaseItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductDatabaseItem | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  // 獲取產品列表
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/database/recipes')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        } else {
          setError('獲取產品列表失敗')
        }
      } catch (err) {
        setError('網絡錯誤，請稍後再試')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // 篩選產品
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.notes && product.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 獲取所有分類
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  // AI 分析功能
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/ingredient-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: 'comprehensive'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result.analysis)
      } else {
        setError(result.error || 'AI 分析失敗')
      }
    } catch (err) {
      setError('AI 分析錯誤，請稍後再試')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleViewProduct = (product: ProductDatabaseItem) => {
    setSelectedProduct(product)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('確定要刪除這個產品嗎？')) return

    try {
      const response = await fetch(`/api/database/recipes/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        if (selectedProduct?.id === productId) {
          setSelectedProduct(null)
        }
      } else {
        setError('刪除產品失敗')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試')
    }
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🗄️ 產品配方資料庫
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              集中管理所有配方，支持搜索、分類和版本控制
            </p>
            
            {/* AI 分析按鈕 */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    AI 原料分析
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setAnalysisResult(null)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>清除分析</span>
              </Button>
            </div>
          </div>

          {/* AI 分析結果 */}
          {analysisResult && (
            <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="icon-container icon-container-purple">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">AI 原料分析結果</h2>
                </div>
                
                <div className="prose max-w-none">
                  <MarkdownRenderer content={analysisResult.content} />
                </div>
                
                {analysisResult.dataSummary && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">數據摘要</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-purple-600">總訂單數:</span>
                        <span className="ml-2 text-purple-800">{analysisResult.dataSummary.totalOrders}</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-600">總原料數:</span>
                        <span className="ml-2 text-purple-800">{analysisResult.dataSummary.totalIngredients}</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-600">最近訂單:</span>
                        <span className="ml-2 text-purple-800">{analysisResult.dataSummary.recentOrders}</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-600">總價值:</span>
                        <span className="ml-2 text-purple-800">HK${analysisResult.dataSummary.totalValue?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <AIDisclaimer type="analysis" />
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左側：搜索和篩選 */}
            <div className="lg:col-span-1">
              <Card className="liquid-glass-card liquid-glass-card-elevated mb-6">
                <div className="liquid-glass-content">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="icon-container icon-container-orange">
                      <Search className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">搜索篩選</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        搜索產品
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="輸入產品名稱或備註..."
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分類篩選
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">全部分類</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        找到 {filteredProducts.length} 個產品
                      </p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          導出
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Upload className="h-4 w-4 mr-1" />
                          導入
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 統計信息 */}
              <Card className="liquid-glass-card liquid-glass-card-elevated">
                <div className="liquid-glass-content">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">統計信息</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">總產品數:</span>
                      <span className="font-medium">{products.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">活躍產品:</span>
                      <span className="font-medium">{products.filter(p => p.isActive).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">分類數量:</span>
                      <span className="font-medium">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最新更新:</span>
                      <span className="font-medium text-xs">
                        {products.length > 0 ? new Date(Math.max(...products.map(p => new Date(p.updatedAt).getTime()))).toLocaleDateString('zh-TW') : '無'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 中間：產品列表 */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">載入中...</p>
                    </div>
                  </div>
                </Card>
              ) : error ? (
                <Card className="liquid-glass-card liquid-glass-card-warning">
                  <div className="liquid-glass-content">
                    <div className="flex items-center space-x-3">
                      <div className="icon-container icon-container-red">
                        <span className="text-white font-bold">!</span>
                      </div>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </Card>
              ) : filteredProducts.length === 0 ? (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="text-center py-12">
                      <div className="icon-container icon-container-gray mx-auto mb-4">
                        <Database className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        暫無產品
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchQuery || selectedCategory ? '沒有找到符合條件的產品' : '還沒有添加任何產品'}
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        添加產品
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="liquid-glass-card liquid-glass-card-interactive">
                      <div className="liquid-glass-content">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {product.productName}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.isActive ? '活躍' : '停用'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">分類:</span>
                                <span className="ml-1">{product.category || '未分類'}</span>
                              </div>
                              <div>
                                <span className="font-medium">版本:</span>
                                <span className="ml-1">{product.version}</span>
                              </div>
                              <div>
                                <span className="font-medium">創建者:</span>
                                <span className="ml-1">{product.createdBy || '系統'}</span>
                              </div>
                              <div>
                                <span className="font-medium">更新:</span>
                                <span className="ml-1">{new Date(product.updatedAt).toLocaleDateString('zh-TW')}</span>
                              </div>
                            </div>

                            {product.notes && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {product.notes}
                              </p>
                            )}

                            {product.tags && typeof product.tags === 'string' && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {JSON.parse(product.tags).map((tag: string, index: number) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 右側：產品詳情 */}
            <div className="lg:col-span-1">
              {selectedProduct ? (
                <Card className="liquid-glass-card liquid-glass-card-elevated sticky top-32">
                  <div className="liquid-glass-content">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="icon-container icon-container-blue">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">產品詳情</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-800 mb-2">{selectedProduct.productName}</h3>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">分類:</span> {selectedProduct.category || '未分類'}</p>
                          <p><span className="font-medium">版本:</span> {selectedProduct.version}</p>
                          <p><span className="font-medium">狀態:</span> 
                            <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                              selectedProduct.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedProduct.isActive ? '活躍' : '停用'}
                            </span>
                          </p>
                          <p><span className="font-medium">創建者:</span> {selectedProduct.createdBy || '系統'}</p>
                          <p><span className="font-medium">創建時間:</span> {new Date(selectedProduct.createdAt).toLocaleDateString('zh-TW')}</p>
                          <p><span className="font-medium">更新時間:</span> {new Date(selectedProduct.updatedAt).toLocaleDateString('zh-TW')}</p>
                        </div>
                      </div>

                      {selectedProduct.notes && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">備註</h4>
                          <p className="text-sm text-gray-600">{selectedProduct.notes}</p>
                        </div>
                      )}

                      {selectedProduct.tags && typeof selectedProduct.tags === 'string' && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">標籤</h4>
                          <div className="flex flex-wrap gap-1">
                            {JSON.parse(selectedProduct.tags).map((tag: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            編輯
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            導出
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="liquid-glass-card liquid-glass-card-elevated sticky top-32">
                  <div className="liquid-glass-content">
                    <div className="text-center py-8">
                      <div className="icon-container icon-container-gray mx-auto mb-4">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        選擇產品
                      </h3>
                      <p className="text-gray-600 text-sm">
                        點擊產品列表中的「查看」按鈕來查看詳細信息
                      </p>
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
