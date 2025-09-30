'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProductionOrder } from '@/types'
import { Button } from '@/components/ui/button'
import { LinkedFilter } from '@/components/ui/linked-filter'
import { LiquidGlassConfirmModal, useLiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { Search, Filter, Download, Eye, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { formatDateOnly } from '@/lib/utils'

interface ResponsiveOrdersListProps {
  initialOrders?: ProductionOrder[]
  initialPagination?: any
}

export function ResponsiveOrdersList({ initialOrders = [], initialPagination }: ResponsiveOrdersListProps) {
  const [orders, setOrders] = useState<ProductionOrder[]>(initialOrders)
  
  // 檢查訂單是否有製程問題或品管備註
  const hasProcessOrQualityIssues = (order: ProductionOrder) => {
    return (order.processIssues && order.processIssues.trim() !== '') || 
           (order.qualityNotes && order.qualityNotes.trim() !== '')
  }
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  
  // Modal hooks
  const deleteConfirmModal = useLiquidGlassModal()
  
  const [filters, setFilters] = useState({
    customerName: '',
    productName: '',
    ingredientName: '',
    capsuleType: '',
    page: 1,
    limit: 10,
    sortBy: 'completionDate',
    sortOrder: 'desc'
  })
  
  // Dropdown options
  const [customerOptions, setCustomerOptions] = useState<Array<{value: string, label: string}>>([])
  const [productOptions, setProductOptions] = useState<Array<{value: string, label: string}>>([])
  const [ingredientOptions, setIngredientOptions] = useState<Array<{value: string, label: string}>>([])
  const [capsuleTypeOptions, setCapsuleTypeOptions] = useState<Array<{value: string, label: string}>>([])

  // Fetch orders data
  const fetchOrders = async (newFilters = filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/orders?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch dropdown options
  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/orders/options')
      if (response.ok) {
        const data = await response.json()
        setCustomerOptions(data.customers.map((item: string) => ({ value: item, label: item })))
        setProductOptions(data.products.map((item: string) => ({ value: item, label: item })))
        setIngredientOptions(data.ingredients.map((item: string) => ({ value: item, label: item })))
        setCapsuleTypeOptions(data.capsuleTypes.map((item: string) => ({ value: item, label: item })))
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchOptions()
  }, [])

  const handleSearch = (newFilters: any) => {
    const updatedFilters = { ...newFilters, page: 1 }
    setFilters(updatedFilters)
    fetchOrders(updatedFilters)
  }

  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    const newFilters = { ...filters, sortBy: field, sortOrder: newOrder }
    setFilters(newFilters)
    fetchOrders(newFilters)
  }

  const getSortIcon = (field: string) => {
    if (filters.sortBy !== field) return <ArrowUpDown className="h-3 w-3" />
    return filters.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  const handleExport = (format: 'csv' | 'excel') => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString())
      }
    })
    params.append('format', format)
    
    window.open(`/api/orders/export?${params}`, '_blank')
  }

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId)
    deleteConfirmModal.openModal()
  }

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return

    try {
      const response = await fetch(`/api/orders/${orderToDelete}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('刪除訂單失敗')
      
      fetchOrders(filters)
      setOrderToDelete(null)
    } catch (error) {
      console.error('刪除訂單錯誤:', error)
      alert('刪除失敗，請重試')
    }
  }

  const getCapsuleColorCode = (color: string) => {
    switch (color) {
      case '紅色': return '#ef4444'
      case '藍色': return '#3b82f6'
      case '綠色': return '#10b981'
      case '黃色': return '#f59e0b'
      case '白色': return '#ffffff'
      case '透明': return 'transparent'
      default: return '#6b7280'
    }
  }

  return (
    <div className="space-y-6">
      {/* 篩選器 */}
      <LinkedFilter
        customerOptions={customerOptions}
        productOptions={productOptions}
        ingredientOptions={ingredientOptions}
        capsuleOptions={capsuleTypeOptions}
        onSearch={handleSearch}
        onExport={() => handleExport('csv')}
        loading={loading}
      />

      {/* 桌面版表格 */}
      <div className="hidden lg:block">
        <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <div className="liquid-glass-content">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                  </div>
                  <span style={{ color: '#2a588c' }}>訂單管理</span>
                </h2>
                <p className="text-gray-600 mt-2">管理所有膠囊生產訂單</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  客戶指定
                </span>
                <span className="inline-flex items-center gap-1 text-blue-500">
                  <ClipboardCheck className="h-4 w-4" /> 品管備註
                </span>
                <span className="inline-flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-4 w-4" /> 製程問題
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
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
                          <div className="flex items-center gap-2">
                            <span>{order.customerName}</span>
                            {hasProcessOrQualityIssues(order) && (
                              <div className="flex items-center gap-1">
                                {order.processIssues && order.processIssues.trim() !== '' && (
                                  <div title={`製程問題: ${order.processIssues}`}>
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  </div>
                                )}
                                {order.qualityNotes && order.qualityNotes.trim() !== '' && (
                                  <div title={`品管備註: ${order.qualityNotes}`}>
                                    <ClipboardCheck className="h-4 w-4 text-blue-500" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {order.productName}
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          <div className="flex items-center gap-2">
                            {order.capsuleColor && (
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300" 
                                style={{ backgroundColor: getCapsuleColorCode(order.capsuleColor) }}
                              />
                            )}
                            <span className="text-sm">
                              {order.capsuleColor || '未設定'}{order.capsuleSize ? order.capsuleSize : ''}{order.capsuleType || ''}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {order.ingredients && order.ingredients.length > 0 ? (
                              order.ingredients
                                .sort((a, b) => (b.unitContentMg || 0) - (a.unitContentMg || 0))
                                .slice(0, 4)
                                .map((ingredient, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full bg-white/70 border border-white/40 text-xs text-gray-700"
                                  >
                                    {ingredient.materialName}
                                  </span>
                                ))
                            ) : (
                              <span className="text-gray-500 text-sm">無原料資料</span>
                            )}
                            {order.ingredients && order.ingredients.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/50 border border-white/40 text-xs text-gray-500">
                                +{order.ingredients.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {order.productionQuantity?.toLocaleString()} 粒
                        </td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.location.href = `/orders/${order.id}/edit`
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="編輯訂單"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(order.id)
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="刪除訂單"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 移動版卡片列表 */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            載入中...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            沒有找到訂單
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction cursor-pointer hover:scale-[1.02] transition-all duration-200"
              onClick={() => window.location.href = `/orders/${order.id}`}
            >
              <div className="p-4 space-y-3">
                {/* 標題行 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {order.productName}
                      </h3>
                      {hasProcessOrQualityIssues(order) && (
                        <div className="flex items-center gap-1">
                          {order.processIssues && order.processIssues.trim() !== '' && (
                            <div title={`製程問題: ${order.processIssues}`}>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </div>
                          )}
                          {order.qualityNotes && order.qualityNotes.trim() !== '' && (
                            <div title={`品管備註: ${order.qualityNotes}`}>
                              <ClipboardCheck className="h-4 w-4 text-blue-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/orders/${order.id}/edit`
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                      title="編輯訂單"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(order.id)
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="刪除訂單"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* 膠囊規格 */}
                <div className="flex items-center gap-2">
                  {order.capsuleColor && (
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" 
                      style={{ backgroundColor: getCapsuleColorCode(order.capsuleColor) }}
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {order.capsuleColor || '未設定'}{order.capsuleSize ? order.capsuleSize : ''}{order.capsuleType || ''}
                  </span>
                </div>

                {/* 原料成分 */}
                <div className="text-sm text-gray-600">
                  {order.ingredients && order.ingredients.length > 0 ? (
                    <div className="space-y-1">
                      <span className="font-medium">主要原料：</span>
                      <div className="flex flex-wrap gap-1">
                        {order.ingredients
                          .sort((a, b) => (b.unitContentMg || 0) - (a.unitContentMg || 0))
                          .slice(0, 3)
                          .map((ingredient, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {ingredient.materialName}
                          </span>
                        ))}
                        {order.ingredients.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            +{order.ingredients.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">無原料資料</span>
                  )}
                </div>

                {/* 底部資訊 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{order.productionQuantity?.toLocaleString()} 粒</span>
                    <span>{order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分頁 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newFilters = { ...filters, page: filters.page - 1 }
              setFilters(newFilters)
              fetchOrders(newFilters)
            }}
            disabled={filters.page <= 1}
          >
            上一頁
          </Button>
          
          <span className="text-sm text-gray-600 px-4">
            第 {filters.page} 頁，共 {pagination.totalPages} 頁
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newFilters = { ...filters, page: filters.page + 1 }
              setFilters(newFilters)
              fetchOrders(newFilters)
            }}
            disabled={filters.page >= pagination.totalPages}
          >
            下一頁
          </Button>
        </div>
      )}

      {/* 刪除確認模態框 */}
      <LiquidGlassConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={deleteConfirmModal.closeModal}
        onConfirm={handleDeleteConfirm}
        title="確認刪除訂單"
        message="您確定要刪除此訂單嗎？此操作無法撤銷，所有相關的配方和原料資料都將被永久刪除。"
        confirmText="刪除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
