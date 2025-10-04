'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { Logo } from '@/components/ui/logo'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Plus, FileText, Eye, Download, Brain, ClipboardList, Calendar, Zap, FlaskConical, ClipboardCheck, Timer, Package2, UserRound, Square, ArrowRight, Clock3 } from 'lucide-react'
import { formatDate, formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { ProductionOrder, OrderWorklog, WorklogWithOrder } from '@/types'
import Link from 'next/link'
import { sumWorkUnits } from '@/lib/worklog'

// 訂單詳情檢視組件
function OrderDetailView({ order }: { order: ProductionOrder }) {
  return (
    <div className="space-y-6">
      {/* AI 助手按鈕 */}
      <div className="flex justify-end">
        <OrderAIAssistant order={order} />
      </div>
      {/* 基本資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">基本資訊</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
            <p><span className="font-medium">產品名字：</span>{order.productName}</p>
            <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
            <p><span className="font-medium">客服：</span>{order.customerService || '未填寫'}</p>
            {(order.capsuleColor || order.capsuleSize || order.capsuleType) && (
              <div className="mt-3 pt-3 border-t">
                <h5 className="font-medium mb-2">膠囊規格</h5>
                {order.capsuleColor && <p><span className="font-medium">顏色：</span>{order.capsuleColor}</p>}
                {order.capsuleSize && <p><span className="font-medium">大小：</span>{order.capsuleSize}</p>}
                {order.capsuleType && <p><span className="font-medium">類型：</span>{order.capsuleType}</p>}
              </div>
            )}
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

      {/* 原料配方 */}
      {order.ingredients && order.ingredients.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">原料配方</h4>
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
      )}
    </div>
  )
}

export default function HomePage() {
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([])
  const [recentWorklogs, setRecentWorklogs] = useState<WorklogWithOrder[]>([])
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication - 檢查兩個認證狀態
    const authStatus = localStorage.getItem('isAuthenticated')
    const easypackAuth = localStorage.getItem('easypack_auth')
    if (authStatus !== 'true' && easypackAuth !== 'true') {
      router.push('/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const fetchRecentOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?limit=5&sortBy=completionDate&sortOrder=desc')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders || [])
      }
    } catch (error) {
      console.error('載入最近訂單錯誤:', error)
    }
  }, [])

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?limit=100&sortBy=completionDate&sortOrder=desc')
      if (response.ok) {
        const data = await response.json()
        console.log('為 AI 載入的所有訂單:', data.orders?.length || 0)
        console.log('未完工訂單:', data.orders?.filter((order: any) => !order.completionDate)?.length || 0)
        setAllOrders(data.orders || [])
      }
    } catch (error) {
      console.error('載入所有訂單錯誤:', error)
    }
  }, [])

  const fetchRecentWorklogs = useCallback(async () => {
    try {
      const response = await fetch('/api/worklogs?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentWorklogs(data.worklogs || [])
      }
    } catch (error) {
      console.error('載入最近工時錯誤:', error)
    }
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        await Promise.all([fetchRecentOrders(), fetchAllOrders(), fetchRecentWorklogs()])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [fetchRecentOrders, fetchAllOrders, fetchRecentWorklogs])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen logo-bg-animation flex flex-col">
      {/* Liquid Glass Navigation */}
        <LiquidGlassNav />

      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 xl:gap-12 items-stretch">
        <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-interactive liquid-glass-card-refraction floating-shapes group h-full">
          <div className="liquid-glass-content flex h-full flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-container icon-container-gradient-sunrise icon-micro-bounce">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-sm sm:text-base md:text-base font-semibold text-[rgb(99,102,241)]">新增配方</h3>
                <p className="text-xs sm:text-sm md:text-sm text-[rgb(99,102,241)]/80">建立新記錄</p>
              </div>
            </div>
            <p className="text-xs sm:text-xs md:text-sm mb-3 sm:mb-3 md:mb-4 leading-relaxed opacity-90">
              建立新的膠囊配方記錄，包含原料配置與生產參數
            </p>
            <div className="mt-auto">
              <Link href="/orders/new">
                <Button className="ripple-effect btn-micro-hover micro-brand-glow w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-sm py-2 sm:py-2 md:py-3">
                  開始建立
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-interactive liquid-glass-card-refraction floating-orbs group h-full">
          <div className="liquid-glass-content flex h-full flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="icon-container icon-container-gradient-emerald icon-micro-bounce">
                <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-sm sm:text-base md:text-base font-semibold text-[rgb(16,185,129)]">生產記錄</h3>
                <p className="text-xs sm:text-sm md:text-sm text-[rgb(16,185,129)]/80">檢視管理</p>
              </div>
            </div>
            <p className="text-xs sm:text-xs md:text-sm mb-3 sm:mb-3 md:mb-4 leading-relaxed opacity-90">
              檢視與管理所有生產記錄，支援搜尋、篩選與編輯
            </p>
            <div className="mt-auto">
              <Link href="/orders">
                <Button className="ripple-effect btn-micro-hover micro-brand-glow w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-sm py-2 sm:py-2 md:py-3">
                  查看記錄
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 最近紀錄區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1.05fr)] gap-4 sm:gap-5 md:gap-6">
        {/* 最近生產紀錄 */}
        <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
          <div className="liquid-glass-content">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm sm:text-base md:text-base font-semibold flex items-center gap-2 text-slate-800">
                  <FileText className="h-4 w-4 text-cyan-600" />
                  最近生產紀錄
                </h3>
                <p className="text-[11px] sm:text-xs md:text-xs opacity-75">
                  最新 5 筆訂單的進度與工時摘要
                </p>
              </div>
              <Link
                href="/orders"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                查看全部訂單
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 skeleton-stagger">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text-sm" />
                <div className="skeleton skeleton-text-sm" />
                <div className="skeleton skeleton-button" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-2.5">
                {recentOrders.map((order) => {
                  const status = order.completionDate
                    ? 'completed'
                    : order.worklogs && order.worklogs.length > 0
                      ? 'inProgress'
                      : 'notStarted'
                  const statusLabel = status === 'completed' ? '已完成' : status === 'inProgress' ? '進行中' : '未開始'
                  const statusAccent = status === 'completed'
                    ? 'from-emerald-500/80 to-emerald-600/90 text-white'
                    : status === 'inProgress'
                      ? 'from-blue-500/80 to-cyan-500/90 text-white'
                      : 'from-slate-200 to-slate-300 text-slate-600'
                  const latestWorklog = order.worklogs && order.worklogs.length > 0
                    ? order.worklogs[order.worklogs.length - 1]
                    : null

                  return (
                    <Link key={order.id} href={`/orders/${order.id}`} className="block">
                      <div className="rounded-2xl bg-white/60 border border-white/60 hover:border-white/85 transition-all duration-200 shadow-[0_6px_18px_rgba(15,32,77,0.07)] hover:shadow-[0_12px_26px_rgba(45,85,155,0.15)]">
                        <div className="p-3.5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-[0.16em]">
                                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                                <span>最近更新</span>
                                <span>建立 {formatDateOnly(order.createdAt)}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900 truncate">{order.productName}</h4>
                              <p className="text-[12px] text-slate-500 truncate">客戶：{order.customerName}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-gradient-to-r ${statusAccent}`}>
                              {status === 'completed' ? <Calendar className="h-3.5 w-3.5" />
                                : status === 'inProgress' ? <Timer className="h-3.5 w-3.5" />
                                : <Square className="h-3.5 w-3.5" />}
                              {statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
                            <div className="rounded-xl bg-white/80 border border-white/60 px-2.5 py-2">
                              <p className="uppercase tracking-[0.12em] text-[10px] text-slate-400 mb-1">訂單數量</p>
                              <p className="text-sm font-semibold text-slate-900">{formatNumber(order.productionQuantity)} 粒</p>
                            </div>
                            <div className="rounded-xl bg-white/80 border border-white/60 px-2.5 py-2">
                              <p className="uppercase tracking-[0.12em] text-[10px] text-slate-400 mb-1">累積工時</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {order.worklogs && order.worklogs.length > 0
                                  ? `${sumWorkUnits(order.worklogs as OrderWorklog[]).toFixed(1)} 工時`
                                  : '—'}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white/80 border border-white/60 px-2.5 py-2">
                              <p className="uppercase tracking-[0.12em] text-[10px] text-slate-400 mb-1">客服</p>
                              <p className="text-sm font-semibold text-slate-900 truncate">{order.customerService || '未填寫'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-[11px] text-slate-500">
                            <div className="flex items-center gap-2">
                              <Package2 className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {order.actualProductionQuantity != null
                                  ? `實際：${formatNumber(order.actualProductionQuantity)} 粒`
                                  : order.materialYieldQuantity != null
                                    ? `材料可做：${formatNumber(order.materialYieldQuantity)} 粒`
                                    : '尚未提供實際數據'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserRound className="h-3.5 w-3.5 text-slate-400" />
                              <span>{formatDateOnly(order.createdAt)}</span>
                            </div>
                          </div>

                          {latestWorklog && (
                            <div className="rounded-xl bg-gradient-to-r from-indigo-500/12 via-indigo-400/10 to-purple-500/12 border border-indigo-100 px-2.5 py-2 text-[11px] text-indigo-600 flex items-center justify-between">
                              <span className="font-medium">最新工時</span>
                              <span>{formatDateOnly(latestWorklog.workDate)} {latestWorklog.startTime} - {latestWorklog.endTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">目前沒有最近的生產記錄。</p>
                <Link href="/orders/new">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    建立第一筆記錄
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* 最近工時紀錄 */}
        <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
          <div className="liquid-glass-content">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm sm:text-base md:text-base font-semibold flex items-center gap-2 text-slate-800">
                  <Clock3 className="h-4 w-4 text-indigo-500" />
                  最近工時紀錄
                </h3>
                <p className="text-[11px] sm:text-xs md:text-xs opacity-75">
                  最新 5 筆填報的工時資訊
                </p>
              </div>
              <Link
                href="/worklogs"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                查看全部工時
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 skeleton-stagger">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text-sm" />
              </div>
            ) : recentWorklogs.length > 0 ? (
              <div className="space-y-2.5">
                {recentWorklogs.map((worklog) => (
                  <Link key={worklog.id} href={`/orders/${worklog.orderId}`} className="block">
                    <div className="rounded-2xl bg-white/60 border border-white/60 hover:border-white/85 transition-all duration-200 shadow-[0_6px_18px_rgba(15,32,77,0.07)] hover:shadow-[0_12px_26px_rgba(45,85,155,0.15)]">
                      <div className="p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-[0.16em]">
                              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                              <span>{formatDateOnly(worklog.workDate)}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {worklog.order?.productName || '未指派訂單'}
                            </h4>
                            <p className="text-[12px] text-slate-500 truncate">
                              客戶：{worklog.order?.customerName || '未填寫'}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-gradient-to-r from-indigo-500/80 to-purple-500/90 text-white">
                            <Timer className="h-3.5 w-3.5" />
                            {worklog.startTime} - {worklog.endTime}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-slate-600">
                          <div className="rounded-xl bg-white/80 border border-white/60 px-2.5 py-2">
                            <p className="uppercase tracking-[0.12em] text-[10px] text-slate-400 mb-1">有效工時</p>
                            <p className="text-sm font-semibold text-slate-900">{(worklog.effectiveMinutes / 60).toFixed(1)} 工時</p>
                          </div>
                          <div className="rounded-xl bg-white/80 border border-white/60 px-2.5 py-2">
                            <p className="uppercase tracking-[0.12em] text-[10px] text-slate-400 mb-1">填報人數</p>
                            <p className="text-sm font-semibold text-slate-900">{worklog.headcount} 人</p>
                          </div>
                        </div>

                        {worklog.notes && (
                          <div className="rounded-xl bg-gradient-to-r from-indigo-500/12 via-indigo-400/10 to-purple-500/12 border border-indigo-100 px-2.5 py-2 text-[11px] text-indigo-600">
                            <span className="font-medium">備註</span>
                            <p className="mt-1 text-[11px] leading-relaxed text-indigo-700 line-clamp-2">
                              {worklog.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">目前沒有最近的工時紀錄。</p>
                <Link href="/worklogs">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    新增工時紀錄
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 輔助工具區塊 */}
      <div className="mb-8">
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-xl md:text-xl font-semibold text-gray-800">
            🛠️ 輔助工具
          </h2>
          <p className="text-gray-600 text-sm md:text-sm">
            提升工作效率的智能工具集
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* AI 配方生成器 */}
          <Link href="/ai-recipe-generator">
            <div className="liquid-glass-card liquid-glass-card-interactive cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-violet mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">AI 配方生成器</h3>
                <p className="text-sm text-gray-600 mb-4">
                  全新 Liquid Glass 體驗，快速產出多版本專業膠囊配方
                </p>
                <div className="inline-flex items-center text-violet-600 text-sm font-medium">
                  開始使用 →
                </div>
              </div>
            </div>
          </Link>

          {/* 製粒分析工具 */}
          <Link href="/granulation-analyzer">
            <div className="liquid-glass-card liquid-glass-card-interactive liquid-glass-card-refraction cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-emerald-light mx-auto mb-4">
                  <FlaskConical className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">製粒分析工具</h3>
                <p className="text-sm text-gray-600 mb-4">
                  多場景模型同步升級，提供更貼近產線的製粒建議
                </p>
                <div className="inline-flex items-center text-emerald-600 text-sm font-medium">
                  開始分析 →
                </div>
              </div>
            </div>
          </Link>

          {/* 工作單生成 */}
          <Link href="/work-orders">
            <div className="liquid-glass-card liquid-glass-card-interactive liquid-glass-card-refraction cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-rose mx-auto mb-4">
                  <ClipboardCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">工作單生成</h3>
                <p className="text-sm text-gray-600 mb-4">
                  一鍵輸出符合 ISO 的工作單，新增樣板與圖檔附件
                </p>
                <div className="inline-flex items-center text-rose-600 text-sm font-medium">
                  生成工作單 →
                </div>
              </div>
            </div>
          </Link>

          {/* 保健品產業新聞 */}
          <Link href="/tools/supplements-news">
            <div className="liquid-glass-card liquid-glass-card-interactive liquid-glass-card-refraction cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-indigo mx-auto mb-4">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.25 11.25l2.25 2.25 5.25-5.25M4.5 19.5h15a1.5 1.5 0 001.5-1.5v-12A1.5 1.5 0 0019.5 4.5h-15A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">保健品產業新聞</h3>
                <p className="text-sm text-gray-600 mb-4">
                  聚合全球 RSS 來源，自由選取管道，快速掌握最新補充品趨勢
                </p>
                <div className="inline-flex items-center text-indigo-600 text-sm font-medium">
                  串流查看 →
                </div>
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* 功能介紹和版本更新 - 並排布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 功能介紹 */}
          <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
            <div className="liquid-glass-content">
              <div className="mb-4">
                <h3 className="text-lg md:text-lg font-semibold text-amber-800 flex items-center mb-2">
                  <span className="mr-2">📋</span>
                  功能介紹
                </h3>
                <p className="text-sm md:text-sm text-amber-600 opacity-80">
                  系統功能說明與使用指南
                </p>
              </div>
              <div className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <div className="bg-amber-50 p-3 md:p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-amber-800">最新上線重點</h4>
                    <span className="text-[11px] text-amber-600">更新：2025/10/03</span>
                  </div>
                  <ul className="space-y-1 text-xs md:text-sm text-amber-700">
                    <li>• 新增工時列表頁面，可依關鍵字、日期篩選並匯出 CSV</li>
                    <li>• 首頁加入最新工時區塊與縮排卡片，桌機雙欄更易瀏覽</li>
                    <li>• 導航列與 Footer 顯示最近工時更新時間，資訊同步</li>
                    <li>• 編輯訂單時工時日期偏移問題已修復，資料更可靠</li>
                  </ul>
                </div>
                <div className="bg-amber-50 p-3 md:p-4 rounded-xl border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-2">日常可用功能</h4>
                  <ul className="space-y-1 text-xs md:text-sm text-amber-700">
                    <li>• 訂單管理：建立、編輯、追蹤生產訂單，查看詳細配方資訊</li>
                    <li>• 智能配方：AI 自動推薦原料配比，支援文字和圖片導入</li>
                    <li>• 專業分析：製粒必要性、填充可行性、合規性檢查等工具</li>
                    <li>• 資料下載：培訓手冊、風險清單等常用文件隨時取用</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-3 md:p-4 rounded-xl border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">技術支援</h4>
                  <div className="text-xs md:text-sm text-yellow-700">
                    <p className="mb-1">如有任何問題或建議，請聯繫：</p>
                    <p className="font-medium">Victor</p>
                    <p className="text-xs text-yellow-600 mt-1">系統管理員</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* 版本更新記錄 */}
          <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
            <div className="liquid-glass-content">
              <div className="mb-4">
                <h3 className="text-base sm:text-lg md:text-lg font-semibold text-blue-800 flex items-center mb-2">
                  <span className="mr-2 text-sm sm:text-base">📝</span>
                  最新版本更新
                </h3>
                <p className="text-xs sm:text-sm md:text-sm text-blue-600 opacity-80">
                  系統功能更新與改進記錄
                </p>
              </div>
              <div className="space-y-4">
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4 className="font-medium text-green-800 text-sm sm:text-base">v2.2.2 - 2025年10月4日</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full self-start sm:self-auto">最新版本</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-green-700">
                    <li>推出工時紀錄專頁，支援匯出與進階篩選</li>
                    <li>首頁新增最近工時卡片、導覽提示最新工時</li>
                    <li>工時日期偏移問題修復，編輯與詳情保持一致</li>
                    <li>Footer 加入工時快連結，資訊入口更齊全</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4 className="font-medium text-blue-800 text-sm sm:text-base">v2.1.0 - 2025年9月30日</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full self-start sm:self-auto">功能更新</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-blue-700">
                    <li>AI 對話體驗更順手，快速複製與重試回答</li>
                    <li>首頁下載中心重整，常用文件一眼找到</li>
                    <li>登入提示一致，切換帳號不再迷路</li>
                    <li>訂單卡片色彩更新，重要狀態更顯眼</li>
                  </ul>
                </div>
                <div className="text-center pt-2">
                  <Link 
                    href="/history"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    查看完整版本歷史 →
                  </Link>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* 智能 AI 助手 - 浮動按鈕 */}
        <SmartAIAssistant 
          orders={allOrders} 
          pageData={{
            currentPage: '/',
            pageDescription: '首頁 - 系統概覽和最近生產記錄',
            timestamp: new Date().toISOString(),
            ordersCount: allOrders.length,
            hasCurrentOrder: false,
            currentOrder: null,
            recentOrders: recentOrders.slice(0, 5)
          }}
        />

        {/* Liquid Glass Modal for Order Details */}
        <LiquidGlassModal
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          title="訂單詳情"
          size="xl"
        >
          {selectedOrder && <OrderDetailView order={selectedOrder} />}
        </LiquidGlassModal>
      </div>

      {/* 底部間距 */}
      <div className="pb-8"></div>

      {/* Footer */}
      <LiquidGlassFooter />
    </div>
  )
}