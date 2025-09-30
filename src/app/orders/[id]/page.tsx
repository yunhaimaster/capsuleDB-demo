'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Download } from 'lucide-react'
import { formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { ProductionOrder } from '@/types'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
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
      <div className="space-y-6 brand-logo-pattern-bg min-h-screen">
        <div className="space-y-6 skeleton-stagger">
          {/* Basic Info Skeleton */}
          <Card className="liquid-glass-card liquid-glass-card-subtle">
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
          <Card className="liquid-glass-card liquid-glass-card-subtle">
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
          <Card className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction max-w-md w-full">
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
    <div className="min-h-screen brand-logo-bg-animation">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav />

      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">


      {/* 操作按鈕 */}
      <div className="flex flex-wrap items-center justify-end gap-3 relative z-10">
        <OrderAIAssistant order={order} />
        <Link href={`/orders/${order.id}/edit`}>
          <Button className="ripple-effect btn-micro-hover bg-blue-600 hover:bg-blue-700 h-10 px-4">
            <Edit className="mr-2 h-4 w-4" />
            編輯
          </Button>
        </Link>
        <Link href="/orders">
          <Button variant="outline" className="ripple-effect btn-micro-hover h-10 px-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </Link>
      </div>

      {/* 基本資訊 */}
        <Card className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <span style={{ color: '#2a588c' }}>基本資訊</span>
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="liquid-glass-card liquid-glass-card-subtle p-4 rounded-2xl space-y-3">
              <h4 className="font-medium text-[--brand-neutral] flex items-center gap-2 text-sm md:text-base">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-500 text-sm font-semibold">客</span>
                客戶資訊
              </h4>
              <div className="grid grid-cols-1 gap-1 text-xs md:text-sm text-slate-700">
                <p><span className="font-medium text-slate-900">客戶名稱：</span>{order.customerName}</p>
                <p><span className="font-medium text-slate-900">產品名字：</span>{order.productName}</p>
                <p><span className="font-medium text-slate-900">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
                <p><span className="font-medium text-slate-900">建檔人員：</span>{order.createdBy || '系統'}</p>
              </div>
            </div>
            
            <div className="liquid-glass-card liquid-glass-card-subtle p-4 rounded-2xl space-y-3">
              <h4 className="font-medium text-[--brand-neutral] flex items-center gap-2 text-sm md:text-base">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 text-sm font-semibold">狀</span>
                生產狀態
              </h4>
              <div className="grid grid-cols-1 gap-1 text-xs md:text-sm text-slate-700">
                <p><span className="font-medium text-slate-900">完工日期：</span>{order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}</p>
                <p><span className="font-medium text-slate-900">單粒總重量：</span>{order.unitWeightMg.toFixed(3)} mg</p>
                <p><span className="font-medium text-slate-900">批次總重量：</span>{convertWeight(order.batchTotalWeightMg).display}</p>
              </div>
            </div>
          </div>

          {(order.capsuleColor || order.capsuleSize || order.capsuleType) && (
            <div className="liquid-glass-card liquid-glass-card-subtle p-4 rounded-2xl space-y-3">
              <h4 className="font-medium text-[--brand-neutral] flex items-center gap-2 text-sm md:text-base">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-500 text-sm font-semibold">膠</span>
                膠囊規格
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm text-slate-700">
                {order.capsuleColor && (
                  <p><span className="font-medium text-slate-900">顏色：</span>{order.capsuleColor}</p>
                )}
                {order.capsuleSize && (
                  <p><span className="font-medium text-slate-900">大小：</span>{order.capsuleSize}</p>
                )}
                {order.capsuleType && (
                  <p><span className="font-medium text-slate-900">成份：</span>{order.capsuleType}</p>
                )}
              </div>
            </div>
          )}

          {(order.processIssues || order.qualityNotes) && (
            <div className="liquid-glass-card liquid-glass-card-subtle p-4 rounded-2xl space-y-3">
              <h4 className="font-medium text-[--brand-neutral] flex items-center gap-2 text-sm md:text-base">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-500 text-sm font-semibold">備</span>
                備註資訊
              </h4>
              <div className="space-y-3 text-xs md:text-sm text-slate-700">
                {order.processIssues && (
                  <div className="rounded-xl border border-red-100 bg-red-50/70 p-3">
                    <span className="font-medium text-red-700 block mb-1">製程問題</span>
                    <p className="leading-relaxed text-red-600 text-sm">{order.processIssues}</p>
                  </div>
                )}
                {order.qualityNotes && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <span className="font-medium text-emerald-700 block mb-1">品管備註</span>
                    <p className="leading-relaxed text-emerald-600 text-sm">{order.qualityNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 原料配方明細 */}
        <Card className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                </svg>
              </div>
              <span style={{ color: '#2a588c' }}>原料配方明細</span>
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="hidden md:block">
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
          </div>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {order.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-slate-800 leading-tight">
                    {ingredient.materialName}
                  </h4>
                  <div className="flex items-center text-xs font-medium text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1" />
                    {ingredient.isCustomerProvided ? '客戶指定' : '自行添加'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-slate-400">單粒含量</span>
                    <span className="text-base font-semibold text-slate-900">
                      {ingredient.unitContentMg.toFixed(3)} mg
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-slate-400">批次用量</span>
                    <span className="text-base font-semibold text-slate-900">
                      {calculateBatchWeight(ingredient.unitContentMg, order.productionQuantity).display}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
      <LiquidGlassFooter />
    </div>
  )
}
