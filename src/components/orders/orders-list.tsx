'use client'

import { useState, useEffect } from 'react'
import { ProductionOrder } from '@/types'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Download, Eye, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'

interface OrdersListProps {
  initialOrders?: ProductionOrder[]
  initialPagination?: any
}

export function OrdersList({ initialOrders = [], initialPagination }: OrdersListProps) {
  const [orders, setOrders] = useState<ProductionOrder[]>(initialOrders)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    customerName: '',
    productName: '',
    ingredientName: '',
    capsuleType: '',
    page: 1,
    limit: 10
  })
  
  // Dropdown options
  const [customerOptions, setCustomerOptions] = useState<string[]>([])
  const [productOptions, setProductOptions] = useState<string[]>([])
  const [ingredientOptions, setIngredientOptions] = useState<string[]>([])
  const [capsuleTypeOptions, setCapsuleTypeOptions] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  const fetchOrders = async (newFilters: any) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
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

  const fetchDropdownOptions = async () => {
    try {
      const response = await fetch('/api/orders/options')
      if (response.ok) {
        const data = await response.json()
        setCustomerOptions(data.customers || [])
        setProductOptions(data.products || [])
        setIngredientOptions(data.ingredients || [])
        setCapsuleTypeOptions(data.capsuleTypes || [])
      }
    } catch (error) {
      console.error('載入下拉選項錯誤:', error)
    }
  }

  useEffect(() => {
    fetchOrders(filters)
  }, [filters.page, filters.limit, filters.customerName, filters.productName, filters.ingredientName, filters.capsuleType])

  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  const handleSearch = (newFilters: any) => {
    // Convert "all" values to empty strings for API
    const processedFilters = { ...newFilters }
    Object.keys(processedFilters).forEach(key => {
      if (processedFilters[key] === 'all') {
        processedFilters[key] = ''
      }
    })
    
    const updatedFilters = { 
      ...filters, 
      ...processedFilters, 
      page: newFilters.page !== undefined ? newFilters.page : 1 
    }
    setFilters(updatedFilters)
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('確定要刪除此訂單嗎？此操作無法復原。')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('刪除訂單失敗')
      
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
          includeIngredients: true
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
    <div className="space-y-6">

        <div className="liquid-glass-card liquid-glass-card-subtle p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客戶名稱
              </label>
              <Select value={filters.customerName || 'all'} onValueChange={(value) => handleSearch({ customerName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇客戶..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部客戶</SelectItem>
                  {customerOptions.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                產品名稱
              </label>
              <Select value={filters.productName || 'all'} onValueChange={(value) => handleSearch({ productName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇產品..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部產品</SelectItem>
                  {productOptions.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原料名稱
              </label>
              <Select value={filters.ingredientName || 'all'} onValueChange={(value) => handleSearch({ ingredientName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇原料..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部原料</SelectItem>
                  {ingredientOptions.map((ingredient) => (
                    <SelectItem key={ingredient} value={ingredient}>
                      {ingredient}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                膠囊類型
              </label>
              <Select value={filters.capsuleType || 'all'} onValueChange={(value) => handleSearch({ capsuleType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇類型..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類型</SelectItem>
                  {capsuleTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => handleExport('csv')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              匯出 CSV
            </Button>
          </div>
        </div>

        <div className="liquid-glass-card liquid-glass-card-subtle">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 ">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 ">
                    客戶名稱
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 ">
                    產品名稱
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 ">
                    生產數量
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 ">
                    完工日期
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 ">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      載入中...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      沒有找到訂單
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 ">
                      <td className="py-3 px-4 text-gray-900 ">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-gray-900 ">
                        {order.productName}
                      </td>
                      <td className="py-3 px-4 text-gray-900 ">
                        {order.productionQuantity?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900 ">
                        {order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/orders/${order.id}/edit`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {pagination && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleSearch({ page: pagination.page - 1 })}
                disabled={pagination.page <= 1}
              >
                上一頁
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-600 ">
                第 {pagination.page} 頁，共 {pagination.totalPages} 頁
              </span>
              <Button
                variant="outline"
                onClick={() => handleSearch({ page: pagination.page + 1 })}
                disabled={pagination.page >= pagination.totalPages}
              >
                下一頁
              </Button>
            </div>
          </div>
        )}

      {showOrderDetails && selectedOrder && (
        <LiquidGlassModal
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          title="訂單詳情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本資訊 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  客戶名稱
                </label>
                <p className="text-white font-medium">{selectedOrder.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  產品名稱
                </label>
                <p className="text-white font-medium">{selectedOrder.productName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  生產數量
                </label>
                <p className="text-white font-medium">{selectedOrder.productionQuantity?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  完工日期
                </label>
                <p className="text-white font-medium">
                  {selectedOrder.completionDate ? formatDateOnly(selectedOrder.completionDate) : '未完工'}
                </p>
              </div>
            </div>

            {/* 膠囊資料 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">膠囊規格</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    膠囊顏色
                  </label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-400" 
                      style={{ backgroundColor: selectedOrder.capsuleColor === '紅色' ? '#ef4444' : 
                                 selectedOrder.capsuleColor === '藍色' ? '#3b82f6' :
                                 selectedOrder.capsuleColor === '綠色' ? '#10b981' :
                                 selectedOrder.capsuleColor === '黃色' ? '#f59e0b' :
                                 selectedOrder.capsuleColor === '白色' ? '#ffffff' :
                                 selectedOrder.capsuleColor === '透明' ? 'transparent' : '#6b7280'
                      }}
                    />
                    <p className="text-white font-medium">{selectedOrder.capsuleColor || '未設定'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    膠囊大小
                  </label>
                  <p className="text-white font-medium">{selectedOrder.capsuleSize || '未設定'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    膠囊類型
                  </label>
                  <p className="text-white font-medium">{selectedOrder.capsuleType || '未設定'}</p>
                </div>
              </div>
            </div>
            
            {selectedOrder.ingredients && selectedOrder.ingredients.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  配方成分
                </label>
                <div className="space-y-2">
                  {selectedOrder.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-transparent border border-white/20 rounded-lg backdrop-blur-sm">
                      <span className="text-white font-medium">{ingredient.materialName}</span>
                      <span className="text-gray-200">{ingredient.unitContentMg}mg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order AI 按鈕 */}
            <div className="flex justify-center pt-4 border-t border-white/20">
              <div onClick={() => setShowOrderDetails(false)}>
                <OrderAIAssistant order={selectedOrder} />
              </div>
            </div>
          </div>
        </LiquidGlassModal>
      )}
    </div>
  )
}
