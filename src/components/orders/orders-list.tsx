'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Filter, Download, Eye, Edit, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate, formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { ProductionOrder, SearchFilters } from '@/types'
import Link from 'next/link'

interface OrdersListProps {
  initialOrders?: ProductionOrder[]
  initialPagination?: any
}

export function OrdersList({ initialOrders = [], initialPagination }: OrdersListProps) {
  const [orders, setOrders] = useState<ProductionOrder[]>(initialOrders)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    customerName: '',
    productName: '',
    ingredientName: '',
    capsuleType: '',
    dateTo: undefined,
    minQuantity: undefined,
    maxQuantity: undefined,
    isCompleted: undefined,
    page: 1,
    limit: 10,
    sortBy: 'completionDate',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  
  // 下拉選單選項狀態
  const [customerOptions, setCustomerOptions] = useState<string[]>([])
  const [productOptions, setProductOptions] = useState<string[]>([])
  const [ingredientOptions, setIngredientOptions] = useState<string[]>([])
  const [capsuleTypeOptions, setCapsuleTypeOptions] = useState<string[]>([])

  // 聯動篩選的選項狀態
  const [filteredProductOptions, setFilteredProductOptions] = useState<string[]>([])
  const [filteredIngredientOptions, setFilteredIngredientOptions] = useState<string[]>([])
  const [filteredCapsuleTypeOptions, setFilteredCapsuleTypeOptions] = useState<string[]>([])

  // 獲取下拉選單選項
  const fetchDropdownOptions = async () => {
    try {
      const response = await fetch('/api/orders/options')
      if (response.ok) {
        const data = await response.json()
        setCustomerOptions(data.customers || [])
        setProductOptions(data.products || [])
        setIngredientOptions(data.ingredients || [])
        setCapsuleTypeOptions(data.capsuleTypes || [])
        
        // 初始化聯動選項
        setFilteredProductOptions(data.products || [])
        setFilteredIngredientOptions(data.ingredients || [])
        setFilteredCapsuleTypeOptions(data.capsuleTypes || [])
      }
    } catch (error) {
      console.error('載入下拉選項錯誤:', error)
    }
  }

  // 獲取聯動篩選選項
  const fetchFilteredOptions = async (filters: SearchFilters) => {
    try {
      const params = new URLSearchParams()
      if (filters.customerName) params.append('customerName', filters.customerName)
      if (filters.productName) params.append('productName', filters.productName)
      if (filters.ingredientName) params.append('ingredientName', filters.ingredientName)
      
      const response = await fetch(`/api/orders/options?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        // 更新聯動選項
        if (filters.customerName) {
          setFilteredProductOptions(data.products || [])
          setFilteredIngredientOptions(data.ingredients || [])
          setFilteredCapsuleTypeOptions(data.capsuleTypes || [])
        }
        
        if (filters.productName) {
          setFilteredIngredientOptions(data.ingredients || [])
          setFilteredCapsuleTypeOptions(data.capsuleTypes || [])
        }
        
        if (filters.ingredientName) {
          setFilteredCapsuleTypeOptions(data.capsuleTypes || [])
        }
      }
    } catch (error) {
      console.error('載入篩選選項錯誤:', error)
    }
  }

  const fetchOrders = async (newFilters: SearchFilters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/orders?${params}`)
      if (!response.ok) throw new Error('載入訂單失敗')
      
      const data = await response.json()
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      console.error('載入訂單錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(filters)
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.customerName, filters.productName, filters.ingredientName, filters.capsuleType, filters.dateTo, filters.minQuantity, filters.maxQuantity, filters.isCompleted])

  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  const handleSearch = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    setFilters(updatedFilters)
    
    // 觸發聯動篩選
    fetchFilteredOptions(updatedFilters)
  }

  const handleSort = (field: string) => {
    const newSortOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    setFilters(prev => ({ ...prev, sortBy: field as any, sortOrder: newSortOrder, page: 1 }))
  }

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return filters.sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('確定要刪除此訂單嗎？此操作無法復原。')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('刪除訂單失敗')
      
      // 重新載入列表
      fetchOrders(filters)
    } catch (error) {
      console.error('刪除訂單錯誤:', error)
      alert('刪除失敗，請重試')
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch('/api/orders/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          includeIngredients: true,
          dateRange: filters.dateTo ? {
            from: filters.dateTo,
            to: filters.dateTo
          } : undefined
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `production-orders-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('匯出失敗，請重試')
    }
  }

  return (
    <div className="space-y-6 animated-gradient-bg-subtle min-h-screen">
      {/* 搜尋和篩選 */}
      <Card className="glass-card-subtle">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl">生產記錄管理</CardTitle>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                支援搜尋客戶名稱、產品名字、原料名稱、膠囊類型
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs md:text-sm"
              >
                <Filter className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                篩選
              </Button>
              <Link href="/orders/new">
                <Button className="text-xs md:text-sm">
                  <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  新增配方
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 主要搜尋條件 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">客戶名稱</label>
              <Input
                placeholder="輸入或選擇客戶名稱..."
                value={filters.customerName || ''}
                onChange={(e) => handleSearch({ customerName: e.target.value })}
                className="text-sm h-10"
                list="customer-list"
              />
              <datalist id="customer-list">
                <option value="" />
                {customerOptions.map((customer) => (
                  <option key={customer} value={customer} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">產品名稱</label>
              <Input
                placeholder="輸入或選擇產品名稱..."
                value={filters.productName || ''}
                onChange={(e) => handleSearch({ productName: e.target.value })}
                className="text-sm h-10"
                list="product-list"
              />
              <datalist id="product-list">
                <option value="" />
                {filteredProductOptions.map((product) => (
                  <option key={product} value={product} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">原料名稱</label>
              <Input
                placeholder="輸入或選擇原料名稱..."
                value={filters.ingredientName || ''}
                onChange={(e) => handleSearch({ ingredientName: e.target.value })}
                className="text-sm h-10"
                list="ingredient-list"
              />
              <datalist id="ingredient-list">
                <option value="" />
                {filteredIngredientOptions.map((ingredient) => (
                  <option key={ingredient} value={ingredient} />
                ))}
              </datalist>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium">膠囊類型</label>
              <Input
                placeholder="輸入或選擇膠囊類型..."
                value={filters.capsuleType || ''}
                onChange={(e) => handleSearch({ capsuleType: e.target.value })}
                className="text-sm h-10"
                list="capsule-type-list"
              />
              <datalist id="capsule-type-list">
                <option value="" />
                {filteredCapsuleTypeOptions.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 清除篩選按鈕 */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  customerName: '',
                  productName: '',
                  ingredientName: '',
                  capsuleType: '',
                  dateTo: undefined,
                  minQuantity: undefined,
                  maxQuantity: undefined,
                  isCompleted: undefined,
                  page: 1,
                  limit: 10,
                  sortBy: 'completionDate',
                  sortOrder: 'desc'
                })
                // 重置聯動選項
                setFilteredProductOptions(productOptions)
                setFilteredIngredientOptions(ingredientOptions)
                setFilteredCapsuleTypeOptions(capsuleTypeOptions)
              }}
              className="text-xs md:text-sm"
            >
              清除所有篩選
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <label className="text-sm font-medium block">完工日期</label>
                <Input
                  type="date"
                  value={filters.dateTo?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleSearch({ 
                    dateTo: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  placeholder="選擇完工日期"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium block">生產數量範圍</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="最小數量"
                    value={filters.minQuantity || ''}
                    onChange={(e) => handleSearch({ 
                      minQuantity: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="text-sm h-10"
                  />
                  <Input
                    type="number"
                    placeholder="最大數量"
                    value={filters.maxQuantity || ''}
                    onChange={(e) => handleSearch({ 
                      maxQuantity: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="text-sm h-10"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium block">生產狀態</label>
                <select
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={filters.isCompleted === undefined ? '' : filters.isCompleted.toString()}
                  onChange={(e) => handleSearch({ 
                    isCompleted: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                >
                  <option value="">全部狀態</option>
                  <option value="false">未完工</option>
                  <option value="true">已完工</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium block">每頁顯示</label>
                <select
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={filters.limit || 10}
                  onChange={(e) => handleSearch({ 
                    limit: parseInt(e.target.value)
                  })}
                >
                  <option value="5">5 筆</option>
                  <option value="10">10 筆</option>
                  <option value="20">20 筆</option>
                  <option value="50">50 筆</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="mr-2 h-4 w-4" />
                匯出 CSV
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              共 {pagination?.total || 0} 筆記錄
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 訂單列表 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 md:p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">載入中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 md:p-8 text-center">
              <p className="text-sm md:text-base text-muted-foreground">沒有找到任何記錄</p>
            </div>
          ) : (
            <>
              {/* 手機卡片式佈局 */}
              <div className="block md:hidden space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="card-subtle-3d glass-card-subtle border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* 標題行 */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{order.customerName}</h3>
                            <p className="text-sm text-gray-600">{order.productName}</p>
                          </div>
                          <div className="text-right">
                            {order.completionDate ? (
                              <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                ✓ 完工 {formatDateOnly(order.completionDate)}
                              </span>
                            ) : (
                              <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                ⏳ 未完工
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 原料信息 */}
                        <div>
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">主要原料</p>
                          <div className="flex flex-wrap gap-1">
                            {order.ingredients && order.ingredients.length > 0 ? (
                              order.ingredients.slice(0, 3).map((ingredient, index) => {
                                const isHighlighted = filters.customerName && 
                                  ingredient.materialName.toLowerCase().includes(filters.customerName.toLowerCase())
                                return (
                                  <span 
                                    key={index} 
                                    className={`text-xs px-2 py-1 rounded ${
                                      isHighlighted 
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700' 
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                    }`}
                                  >
                                    {ingredient.materialName}
                                  </span>
                                )
                              })
                            ) : (
                              <span className="text-xs text-gray-400">無原料資料</span>
                            )}
                            {order.ingredients && order.ingredients.length > 3 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer">
                                    +{order.ingredients.length - 3} 更多
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>原料配方明細 - {order.customerName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">基本資訊</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
                                          <p><span className="font-medium">產品名字：</span>{order.productName}</p>
                                          <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">生產狀態</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="font-medium">完工日期：</span>
                                            {order.completionDate ? formatDate(order.completionDate) : '未完工'}
                                          </p>
                                          <p><span className="font-medium">單粒總重量：</span>{order.unitWeightMg.toFixed(3)} mg</p>
                                          <p><span className="font-medium">批次總重量：</span>{convertWeight(order.batchTotalWeightMg).display}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">原料配方明細</h4>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>原料品名</TableHead>
                                            <TableHead>單粒含量 (mg)</TableHead>
                                            <TableHead>批次用量</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.ingredients.map((ingredient, index) => (
                                            <TableRow key={index}>
                                              <TableCell>{ingredient.materialName}</TableCell>
                                              <TableCell>{ingredient.unitContentMg.toFixed(3)}</TableCell>
                                              <TableCell>
                                                {calculateBatchWeight(ingredient.unitContentMg, order.productionQuantity).display}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>

                        {/* 膠囊類型 */}
                        {(order.capsuleSize || order.capsuleColor || order.capsuleType) && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">膠囊類型</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {[order.capsuleSize, order.capsuleColor, order.capsuleType].filter(Boolean).join('')}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* 生產信息 */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">生產數量</p>
                            <p className="font-medium">{formatNumber(order.productionQuantity)} 粒</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">單粒重量</p>
                            <p className="font-medium">{order.unitWeightMg.toFixed(3)} mg</p>
                          </div>
                        </div>

                        {/* 製程問題 */}
                        {order.processIssues && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">製程問題</p>
                            <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
                              {order.processIssues.length > 100 
                                ? `${order.processIssues.substring(0, 100)}...` 
                                : order.processIssues
                              }
                            </div>
                          </div>
                        )}

                        {/* 操作按鈕 */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1 text-xs">
                                <Eye className="mr-1 h-3 w-3" />
                                查看
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>生產記錄詳情</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* AI 助手按鈕 */}
                                <div className="flex justify-center sm:justify-end mb-4 px-2 sm:px-0">
                                  <div className="w-full sm:w-auto flex justify-center">
                                    <OrderAIAssistant order={order} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">客戶名稱</Label>
                                    <p className="text-sm">{order.customerName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">產品名字</Label>
                                    <p className="text-sm">{order.productName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">生產數量</Label>
                                    <p className="text-sm">{formatNumber(order.productionQuantity)} 粒</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">單粒總重量</Label>
                                    <p className="text-sm">{order.unitWeightMg.toFixed(3)} mg</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">批次總重量</Label>
                                    <p className="text-sm">{convertWeight(order.batchTotalWeightMg).display}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">完工日期</Label>
                                    <p className="text-sm">{order.completionDate ? formatDate(order.completionDate) : '未完工'}</p>
                                  </div>
                                </div>
                                
                                {order.processIssues && (
                                  <div>
                                    <Label className="text-sm font-medium">製程問題記錄</Label>
                                    <p className="text-sm bg-red-50 p-3 rounded border border-red-200">{order.processIssues}</p>
                                  </div>
                                )}
                                
                                {order.qualityNotes && (
                                  <div>
                                    <Label className="text-sm font-medium">品管備註</Label>
                                    <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">{order.qualityNotes}</p>
                                  </div>
                                )}

                                <div>
                                  <Label className="text-sm font-medium">原料明細</Label>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>原料名稱</TableHead>
                                        <TableHead>單粒含量(mg)</TableHead>
                                        <TableHead>批次用量</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.ingredients?.map((ingredient, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{ingredient.materialName}</TableCell>
                                          <TableCell>{ingredient.unitContentMg.toFixed(5)}</TableCell>
                                          <TableCell>{convertWeight(ingredient.unitContentMg * order.productionQuantity).display}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Link href={`/orders/${order.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <Edit className="mr-1 h-3 w-3" />
                              編輯
                            </Button>
                          </Link>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(order.id)}
                            className="flex-1 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            刪除
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 桌面表格佈局 */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('customerName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>客戶名稱</span>
                        {getSortIcon('customerName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('productName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>產品名字</span>
                        {getSortIcon('productName')}
                      </div>
                    </TableHead>
                    <TableHead className="text-xs md:text-sm">主要原料</TableHead>
                    <TableHead className="text-xs md:text-sm">膠囊類型</TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('productionQuantity')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>生產數量</span>
                        {getSortIcon('productionQuantity')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('unitWeightMg')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>單粒總重量</span>
                        {getSortIcon('unitWeightMg')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-xs md:text-sm cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('completionDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>完工狀態</span>
                        {getSortIcon('completionDate')}
                      </div>
                    </TableHead>
                    <TableHead className="text-xs md:text-sm">製程問題</TableHead>
                    <TableHead className="w-[120px] md:w-[200px] text-xs md:text-sm">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {filters.customerName && 
                       order.customerName.toLowerCase().includes(filters.customerName.toLowerCase()) ? (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                          {order.customerName}
                        </span>
                      ) : (
                        order.customerName
                      )}
                    </TableCell>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {order.ingredients && order.ingredients.length > 0 ? (
                          <div className="space-y-1">
                            {order.ingredients.slice(0, 2).map((ingredient, index) => {
                              const isHighlighted = filters.customerName && 
                                ingredient.materialName.toLowerCase().includes(filters.customerName.toLowerCase())
                              return (
                                <div 
                                  key={index} 
                                  className={`text-xs px-2 py-1 rounded ${
                                    isHighlighted 
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700' 
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                  }`}
                                >
                                  {ingredient.materialName}
                                </div>
                              )
                            })}
                            {order.ingredients.length > 2 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer">
                                    +{order.ingredients.length - 2} 更多
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>原料配方明細 - {order.customerName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">基本資訊</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
                                          <p><span className="font-medium">產品名字：</span>{order.productName}</p>
                                          <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">生產狀態</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="font-medium">完工日期：</span>
                                            {order.completionDate ? formatDate(order.completionDate) : '未完工'}
                                          </p>
                                          <p><span className="font-medium">單粒總重量：</span>{order.unitWeightMg.toFixed(3)} mg</p>
                                          <p><span className="font-medium">批次總重量：</span>{convertWeight(order.batchTotalWeightMg).display}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-medium mb-2">原料配方明細</h4>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>原料品名</TableHead>
                                            <TableHead>單粒含量 (mg)</TableHead>
                                            <TableHead>批次用量</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.ingredients.map((ingredient, index) => (
                                            <TableRow key={index}>
                                              <TableCell>{ingredient.materialName}</TableCell>
                                              <TableCell>{ingredient.unitContentMg.toFixed(3)}</TableCell>
                                              <TableCell>
                                                {calculateBatchWeight(ingredient.unitContentMg, order.productionQuantity).display}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">無原料資料</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(order.capsuleSize || order.capsuleColor || order.capsuleType) ? (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {[order.capsuleSize, order.capsuleColor, order.capsuleType].filter(Boolean).join('')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">未設定</span>
                      )}
                    </TableCell>
                    <TableCell>{formatNumber(order.productionQuantity)} 粒</TableCell>
                    <TableCell>{order.unitWeightMg.toFixed(3)} mg</TableCell>
                    <TableCell>
                      {order.completionDate ? (
                        <span className="status-badge status-completed">
                          ✓ 完工 {formatDateOnly(order.completionDate)}
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          ⏳ 未完工
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px]">
                        {order.processIssues ? (
                          <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
                            {order.processIssues.length > 50 
                              ? `${order.processIssues.substring(0, 50)}...` 
                              : order.processIssues
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">無問題</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>訂單詳情</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <OrderDetailView order={selectedOrder} />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Link href={`/orders/${order.id}/edit`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 分頁 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => handleSearch({ page: (filters.page || 1) - 1 })}
          >
            上一頁
          </Button>
          <span className="text-sm">
            第 {filters.page} 頁，共 {pagination.totalPages} 頁
          </span>
          <Button
            variant="outline"
            disabled={filters.page === pagination.totalPages}
            onClick={() => handleSearch({ page: (filters.page || 1) + 1 })}
          >
            下一頁
          </Button>
        </div>
      )}
    </div>
  )
}

// 訂單詳情檢視組件
function OrderDetailView({ order }: { order: ProductionOrder }) {
  return (
    <div className="space-y-6">
      {/* AI 助手按鈕 */}
      <div className="flex justify-center sm:justify-end mb-4 px-2 sm:px-0">
        <div className="w-full sm:w-auto flex justify-center">
          <OrderAIAssistant order={order} />
        </div>
      </div>
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">基本資訊</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
            <p><span className="font-medium">產品名字：</span>{order.productName}</p>
            <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
            <p><span className="font-medium">建檔人員：</span>{order.createdBy || '系統'}</p>
            {(order.capsuleColor || order.capsuleSize || order.capsuleType) && (
              <div className="mt-3 pt-3 border-t">
                <h5 className="font-medium mb-2">膠囊規格</h5>
                {order.capsuleColor && <p><span className="font-medium">顏色：</span>{order.capsuleColor}</p>}
                {order.capsuleSize && <p><span className="font-medium">大小：</span>{order.capsuleSize}</p>}
                {order.capsuleType && <p><span className="font-medium">成份：</span>{order.capsuleType}</p>}
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">生產狀態</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">完工日期：</span>
              {order.completionDate ? formatDate(order.completionDate) : '未完工'}
            </p>
            <p><span className="font-medium">單粒總重量：</span>{order.unitWeightMg.toFixed(3)} mg</p>
            <p><span className="font-medium">批次總重量：</span>{convertWeight(order.batchTotalWeightMg).display}</p>
          </div>
        </div>
      </div>

      {/* 製程問題記錄 */}
      {order.processIssues && (
        <div>
          <h4 className="font-medium mb-2">製程問題記錄</h4>
          <div className="p-3 bg-muted rounded-md text-sm">
            {order.processIssues}
          </div>
        </div>
      )}

      {/* 品管備註 */}
      {order.qualityNotes && (
        <div>
          <h4 className="font-medium mb-2">品管備註</h4>
          <div className="p-3 bg-muted rounded-md text-sm">
            {order.qualityNotes}
          </div>
        </div>
      )}

      {/* 原料配方明細 */}
      <div>
        <h4 className="font-medium mb-2">原料配方明細</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>原料品名</TableHead>
              <TableHead>單粒含量 (mg)</TableHead>
              <TableHead>批次用量</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.ingredients.map((ingredient, index) => (
              <TableRow key={index}>
                <TableCell>{ingredient.materialName}</TableCell>
                <TableCell>{ingredient.unitContentMg.toFixed(3)}</TableCell>
                <TableCell>
                  {calculateBatchWeight(ingredient.unitContentMg, order.productionQuantity).display}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
