'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Download } from 'lucide-react'
import { formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { ProductionOrder } from '@/types'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import Link from 'next/link'

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<ProductionOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('訂單不存在')
        } else {
          setError('載入訂單失敗')
        }
        return
      }
      
      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error('載入訂單錯誤:', error)
      setError('載入訂單失敗')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animated-gradient-bg-subtle min-h-screen">
        <div className="space-y-6 skeleton-stagger">
          {/* Basic Info Skeleton */}
          <Card className="glass-card-subtle">
            <CardHeader>
              <div className="skeleton skeleton-title"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="skeleton skeleton-text-sm"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
                <div className="space-y-2">
                  <div className="skeleton skeleton-text-sm"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ingredients Skeleton */}
          <Card className="glass-card-subtle">
            <CardHeader>
              <div className="skeleton skeleton-title"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="skeleton skeleton-table-row"></div>
                <div className="skeleton skeleton-table-row"></div>
                <div className="skeleton skeleton-table-row"></div>
                <div className="skeleton skeleton-table-row"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="card-3d-hover glass-card-easy-health max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-red-600">載入失敗</CardTitle>
              <CardDescription>{error || '訂單不存在'}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/orders">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回生產記錄
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="animated-gradient-bg-subtle min-h-screen">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單管理' },
          { href: '/production-order-form', label: '新建訂單' }
        ]}
        ctaText="返回首頁"
        ctaHref="/"
      />

      {/* Main Content with padding for fixed nav */}
      <div className="pt-20 px-4 sm:px-6 md:px-8 space-y-6 floating-stars">

      {/* 頁面標題 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800">訂單詳情</h1>
            <p className="text-blue-700 text-sm md:text-base mt-1">
              {order.customerName} - {order.productName}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 relative z-10">
            <OrderAIAssistant order={order} />
            <Link href={`/orders/${order.id}/edit`}>
              <Button className="ripple-effect btn-micro-hover bg-blue-600 hover:bg-blue-700">
                <Edit className="mr-2 h-4 w-4" />
                編輯
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="ripple-effect btn-micro-hover">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 基本資訊 */}
        <Card className="card-subtle-3d glass-card-subtle">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">基本資訊</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">客戶資訊</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
                <p><span className="font-medium">產品名字：</span>{order.productName}</p>
                <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
                <p><span className="font-medium">建檔人員：</span>{order.createdBy || '系統'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">生產狀態</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">完工日期：</span>
                  {order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}
                </p>
                <p><span className="font-medium">單粒總重量：</span>{order.unitWeightMg.toFixed(3)} mg</p>
                <p><span className="font-medium">批次總重量：</span>{convertWeight(order.batchTotalWeightMg).display}</p>
              </div>
            </div>
          </div>

          {/* 膠囊規格 */}
          {(order.capsuleColor || order.capsuleSize || order.capsuleType) && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">膠囊規格</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {order.capsuleColor && (
                  <p><span className="font-medium">顏色：</span>{order.capsuleColor}</p>
                )}
                {order.capsuleSize && (
                  <p><span className="font-medium">大小：</span>{order.capsuleSize}</p>
                )}
                {order.capsuleType && (
                  <p><span className="font-medium">成份：</span>{order.capsuleType}</p>
                )}
              </div>
            </div>
          )}

          {/* 製程問題和品管備註 */}
          {(order.processIssues || order.qualityNotes) && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">備註資訊</h4>
              <div className="space-y-2 text-sm">
                {order.processIssues && (
                  <div>
                    <span className="font-medium">製程問題：</span>
                    <p className="text-red-700 bg-red-50 p-2 rounded mt-1">{order.processIssues}</p>
                  </div>
                )}
                {order.qualityNotes && (
                  <div>
                    <span className="font-medium">品管備註：</span>
                    <p className="text-green-700 bg-green-50 p-2 rounded mt-1">{order.qualityNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 原料配方明細 */}
        <Card className="card-subtle-3d glass-card-subtle">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">原料配方明細</CardTitle>
          </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>原料品名</TableHead>
                <TableHead>單粒含量 (mg)</TableHead>
                <TableHead>客戶指定</TableHead>
                <TableHead>批次用量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.ingredients.map((ingredient, index) => (
                <TableRow key={index}>
                  <TableCell>{ingredient.materialName}</TableCell>
                  <TableCell>{ingredient.unitContentMg.toFixed(3)}</TableCell>
                  <TableCell>
                    {ingredient.isCustomerProvided ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs sm:text-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        客戶指定
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-500 text-xs sm:text-sm">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        自行添加
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {calculateBatchWeight(ingredient.unitContentMg, order.productionQuantity).display}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 智能 AI 助手 - 浮動按鈕 */}
      <SmartAIAssistant 
        orders={[order]} 
        currentOrder={order}
        pageData={{
          currentPage: `/orders/${order.id}`,
          pageDescription: `訂單詳情頁面 - ${order.customerName} - ${order.productName}`,
          timestamp: new Date().toISOString(),
          ordersCount: 1,
          hasCurrentOrder: true,
          currentOrder: order,
          recentOrders: [order]
        }}
      />
      </div>
    </div>
  )
}
