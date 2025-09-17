'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Filter, Download, Eye, Edit, Trash2, Plus } from 'lucide-react'
import { formatDate, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
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
    productCode: '',
    dateFrom: undefined,
    dateTo: undefined,
    isCompleted: undefined,
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)

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
      if (!response.ok) throw new Error('Failed to fetch orders')
      
      const data = await response.json()
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(filters)
  }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder, filters.customerName, filters.productCode, filters.dateFrom, filters.dateTo, filters.isCompleted])

  const handleSearch = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('確定要刪除此訂單嗎？此操作無法復原。')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete order')
      
      // 重新載入列表
      fetchOrders(filters)
    } catch (error) {
      console.error('Error deleting order:', error)
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
          dateRange: filters.dateFrom && filters.dateTo ? {
            from: filters.dateFrom,
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
    <div className="space-y-6">
      {/* 搜尋和篩選 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>生產記錄管理</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                篩選
              </Button>
              <Link href="/orders/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新增配方
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="搜尋客戶名稱或產品代號..."
                value={filters.customerName || ''}
                onChange={(e) => handleSearch({ customerName: e.target.value })}
              />
            </div>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              搜尋
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <label className="text-sm font-medium">產品代號</label>
                <Input
                  placeholder="產品代號"
                  value={filters.productCode || ''}
                  onChange={(e) => handleSearch({ productCode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">開始日期</label>
                <Input
                  type="date"
                  value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleSearch({ 
                    dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">結束日期</label>
                <Input
                  type="date"
                  value={filters.dateTo?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleSearch({ 
                    dateTo: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">生產狀態</label>
                <select
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  value={filters.isCompleted === undefined ? '' : filters.isCompleted.toString()}
                  onChange={(e) => handleSearch({ 
                    isCompleted: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                >
                  <option value="">全部</option>
                  <option value="false">未完工</option>
                  <option value="true">已完工</option>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
              >
                <Download className="mr-2 h-4 w-4" />
                匯出 PDF
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
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">載入中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">沒有找到任何記錄</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>建檔日期</TableHead>
                  <TableHead>客戶名稱</TableHead>
                  <TableHead>產品代號</TableHead>
                  <TableHead>生產數量</TableHead>
                  <TableHead>單粒總重量</TableHead>
                  <TableHead>批次總重量</TableHead>
                  <TableHead>完工日期</TableHead>
                  <TableHead>建檔人員</TableHead>
                  <TableHead className="w-[200px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.productCode}</TableCell>
                    <TableCell>{formatNumber(order.productionQuantity)} 粒</TableCell>
                    <TableCell>{order.unitWeightMg.toFixed(3)} mg</TableCell>
                    <TableCell>{convertWeight(order.batchTotalWeightMg).display}</TableCell>
                    <TableCell>
                      {order.completionDate ? (
                        <span className="status-badge status-completed">
                          ✓ 已完工
                        </span>
                      ) : (
                        <span className="status-badge status-pending">
                          ⏳ 未完工
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{order.createdBy || '系統'}</TableCell>
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
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 分頁 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => handleSearch({ page: filters.page - 1 })}
          >
            上一頁
          </Button>
          <span className="text-sm">
            第 {filters.page} 頁，共 {pagination.totalPages} 頁
          </span>
          <Button
            variant="outline"
            disabled={filters.page === pagination.totalPages}
            onClick={() => handleSearch({ page: filters.page + 1 })}
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
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">基本資訊</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
            <p><span className="font-medium">產品代號：</span>{order.productCode}</p>
            <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
            <p><span className="font-medium">建檔日期：</span>{formatDate(order.createdAt)}</p>
            <p><span className="font-medium">建檔人員：</span>{order.createdBy || '系統'}</p>
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
              <TableHead>小計</TableHead>
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
                <TableCell>
                  {convertWeight(ingredient.unitContentMg).display}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
