'use client'

import { useState, useEffect } from 'react'
import { ProductionOrder } from '@/types'
import { Button } from '@/components/ui/button'
import { LinkedFilter } from '@/components/ui/linked-filter'
import { Search, Filter, Download, Eye, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'

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
    limit: 25,
    sortBy: 'completionDate',
    sortOrder: 'desc'
  })
  
  // Dropdown options
  const [customerOptions, setCustomerOptions] = useState<{value: string, label: string}[]>([])
  const [productOptions, setProductOptions] = useState<{value: string, label: string}[]>([])
  const [ingredientOptions, setIngredientOptions] = useState<{value: string, label: string}[]>([])
  const [capsuleTypeOptions, setCapsuleTypeOptions] = useState<{value: string, label: string}[]>([])

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
        setCustomerOptions((data.customers || []).map((item: string) => ({ value: item, label: item })))
        setProductOptions((data.products || []).map((item: string) => ({ value: item, label: item })))
        setIngredientOptions((data.ingredients || []).map((item: string) => ({ value: item, label: item })))
        setCapsuleTypeOptions((data.capsuleTypes || []).map((item: string) => ({ value: item, label: item })))
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

  const handleSearch = (searchFilters: {
    customerName: string
    productName: string
    ingredientName: string
    capsuleType: string
  }) => {
    const updatedFilters = { 
      ...filters, 
      ...searchFilters,
      page: 1 // Reset to first page when searching
    }
    setFilters(updatedFilters)
    fetchOrders(updatedFilters)
  }

  const handleLimitChange = (limit: number) => {
    const updatedFilters = {
      ...filters,
      limit,
      page: 1
    }
    setFilters(updatedFilters)
    fetchOrders(updatedFilters)
  }

  const handlePageChange = (page: number) => {
    const updatedFilters = { 
      ...filters, 
      page
    }
    setFilters(updatedFilters)
    fetchOrders(updatedFilters)
  }

  const handleSort = (column: string) => {
    let newSortOrder = 'asc'
    
    // 如果點擊的是當前排序列，切換排序順序
    if (filters.sortBy === column && filters.sortOrder === 'asc') {
      newSortOrder = 'desc'
    } else if (filters.sortBy === column && filters.sortOrder === 'desc') {
      newSortOrder = 'asc'
    }
    
    const updatedFilters = {
      ...filters,
      sortBy: column,
      sortOrder: newSortOrder,
      page: 1 // Reset to first page when sorting
    }
    
    setFilters(updatedFilters)
    fetchOrders(updatedFilters)
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    }
    
    return filters.sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-gray-600" />
      : <ArrowDown className="h-3 w-3 text-gray-600" />
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

        <LinkedFilter
          customerOptions={customerOptions}
          productOptions={productOptions}
          ingredientOptions={ingredientOptions}
          capsuleOptions={capsuleTypeOptions}
          onSearch={handleSearch}
          onExport={() => handleExport('csv')}
          loading={loading}
          limit={filters.limit}
          onLimitChange={handleLimitChange}
        />

        <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <div className="liquid-glass-content">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span style={{ color: '#2a588c' }}>訂單管理</span>
              </h2>
              <p className="text-gray-600 mt-2">管理所有膠囊生產訂單</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    <button
                      onClick={() => handleSort('customerName')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      客戶名稱
                      {getSortIcon('customerName')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    <button
                      onClick={() => handleSort('productName')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      產品名稱
                      {getSortIcon('productName')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    <button
                      onClick={() => handleSort('capsuleColor')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      膠囊規格
                      {getSortIcon('capsuleColor')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    <button
                      onClick={() => handleSort('ingredients')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      原料成分
                      {getSortIcon('ingredients')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    <button
                      onClick={() => handleSort('productionQuantity')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      生產數量
                      {getSortIcon('productionQuantity')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    <button
                      onClick={() => handleSort('completionDate')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      完工日期
                      {getSortIcon('completionDate')}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      載入中...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      沒有找到訂單
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/orders/${order.id}`}
                    >
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        {order.productName}
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        <div className="flex items-center gap-2">
                          {order.capsuleColor && (
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: order.capsuleColor === '紅色' ? '#ef4444' : 
                                         order.capsuleColor === '藍色' ? '#3b82f6' :
                                         order.capsuleColor === '綠色' ? '#10b981' :
                                         order.capsuleColor === '黃色' ? '#f59e0b' :
                                         order.capsuleColor === '白色' ? '#ffffff' :
                                         order.capsuleColor === '透明' ? 'transparent' : '#6b7280'
                              }}
                            />
                          )}
                          <span className="text-sm">
                            {order.capsuleColor || '未設定'}{order.capsuleSize ? order.capsuleSize : ''}{order.capsuleType || ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        <div className="text-sm max-w-xs">
                          {order.ingredients && order.ingredients.length > 0 ? (
                            <div className="space-y-1">
                              {order.ingredients
                                .sort((a, b) => (b.unitContentMg || 0) - (a.unitContentMg || 0))
                                .slice(0, 2)
                                .map((ingredient, index) => (
                                <div key={index}>
                                  <span className="text-sm">{ingredient.materialName}</span>
                                </div>
                              ))}
                              {order.ingredients.length > 2 && (
                                <div className="text-gray-500 text-sm">
                                  +{order.ingredients.length - 2} 更多...
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">無原料資料</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        {order.productionQuantity?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900 text-sm">
                        {order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/orders/${order.id}/edit`}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(order.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
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
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                上一頁
              </Button>
              <span className="flex items-center px-4 py-2 text-sm text-gray-600 ">
                第 {pagination.page} 頁，共 {pagination.totalPages} 頁
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                下一頁
              </Button>
            </div>
          </div>
        )}

    </div>
  )
}
