'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { fetchWithTimeout } from '@/lib/api-client'
import { downloadFile, formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { sumWorkUnits } from '@/lib/worklog'
import type { ProductionOrder, OrderWorklog, WorklogWithOrder } from '@/types'
import { Plus, FileText, ArrowRight, Calendar, Timer, ClipboardList, Clock3, Brain, FlaskConical, ClipboardCheck } from 'lucide-react'

const SmartAIAssistant = dynamic(
  () => import('@/components/ai/smart-ai-assistant').then((mod) => mod.SmartAIAssistant),
  { ssr: false }
)

const OrderAIAssistant = dynamic(
  () => import('@/components/ai/order-ai-assistant').then((mod) => mod.OrderAIAssistant),
  { ssr: false }
)

const QUICK_CARD_PADDING = 'px-4 py-4 sm:px-6 sm:py-6'
const MINI_CARD_PADDING = 'px-3 sm:px-3.5 py-3'

const STATUS_PRIORITY: Record<'inProgress' | 'notStarted' | 'completed', number> = {
  inProgress: 0,
  notStarted: 1,
  completed: 2,
}

const ORDER_FETCH_LIMIT = 50
const WORKLOG_DISPLAY_LIMIT = 5
const ORDER_DISPLAY_LIMIT = 5

const getOrderStatus = (order: ProductionOrder) => {
  const hasWorklog = Array.isArray(order.worklogs) && order.worklogs.length > 0
  const completed = Boolean(order.completionDate)
  if (hasWorklog && !completed) return 'inProgress'
  if (!completed) return 'notStarted'
  return 'completed'
}

const getOrderDate = (order: ProductionOrder) => {
  const raw = order.completionDate ?? order.createdAt
  if (!raw) return DateTime.invalid('missing')
  if (raw instanceof Date) return DateTime.fromJSDate(raw, { zone: 'Asia/Hong_Kong' })
  return DateTime.fromISO(raw, { zone: 'Asia/Hong_Kong' })
}

const sortOrdersForHomepage = (orders: ProductionOrder[]) =>
  [...orders]
    .map((order) => ({
      ...order,
      worklogs: order.worklogs || [],
    }))
    .sort((a, b) => {
      const statusA = getOrderStatus(a)
      const statusB = getOrderStatus(b)
      if (statusA !== statusB) {
        return STATUS_PRIORITY[statusA] - STATUS_PRIORITY[statusB]
      }

      const dateA = getOrderDate(a)
      const dateB = getOrderDate(b)
      if (dateA.isValid && dateB.isValid) {
        return dateB.toMillis() - dateA.toMillis()
      }
      return 0
    })

const formatWorklogDate = (value: string) => {
  const date = DateTime.fromISO(value, { zone: 'Asia/Hong_Kong' })
  if (!date.isValid) return value
  return date.toFormat('yyyy/MM/dd (ccc)', { locale: 'zh-Hant' })
}

function OrderDetailView({ order }: { order: ProductionOrder }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <OrderAIAssistant order={order} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">基本資訊</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">客戶名稱：</span>{order.customerName}</p>
            <p><span className="font-medium">產品名字：</span>{order.productName}</p>
            <p><span className="font-medium">生產數量：</span>{formatNumber(order.productionQuantity)} 粒</p>
            <p><span className="font-medium">客服：</span>{order.customerService || '未填寫'}</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2">生產狀態</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">完工日期：</span>{order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}</p>
            <p><span className="font-medium">單粒總重量：</span>{order.unitWeightMg.toFixed(3)} mg</p>
            <p><span className="font-medium">批次總重量：</span>{convertWeight(order.batchTotalWeightMg).display}</p>
          </div>
        </div>
      </div>

      {order.ingredients?.length ? (
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
                  <TableCell>{calculateBatchWeight(ingredient.unitContentMg, order.productionQuantity).display}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}

export function HomePageClient() {
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([])
  const [recentWorklogs, setRecentWorklogs] = useState<WorklogWithOrder[]>([])
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
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
      const response = await fetchWithTimeout(`/api/orders?limit=${ORDER_FETCH_LIMIT}&sortBy=completionDate&sortOrder=desc`)
      if (!response.ok) return
      const payload = await response.json()
      if (!payload?.success) return
      const orders = Array.isArray(payload.data?.orders) ? payload.data.orders : []
      setRecentOrders(sortOrdersForHomepage(orders).slice(0, ORDER_DISPLAY_LIMIT))
    } catch (error) {
      console.error('載入最近訂單錯誤:', error)
    }
  }, [])

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(`/api/orders?limit=${ORDER_FETCH_LIMIT}&sortBy=completionDate&sortOrder=desc`)
      if (!response.ok) return
      const payload = await response.json()
      if (!payload?.success) return
      setAllOrders(Array.isArray(payload.data?.orders) ? payload.data.orders : [])
    } catch (error) {
      console.error('載入所有訂單錯誤:', error)
    }
  }, [])

  const fetchRecentWorklogs = useCallback(async () => {
    try {
      const response = await fetchWithTimeout(`/api/worklogs?limit=${WORKLOG_DISPLAY_LIMIT}&sortOrder=desc`)
      if (!response.ok) return
      const payload = await response.json()
      if (!payload?.success) return
      setRecentWorklogs(Array.isArray(payload.data?.worklogs) ? payload.data.worklogs.slice(0, WORKLOG_DISPLAY_LIMIT) : [])
    } catch (error) {
      console.error('載入最近工時錯誤:', error)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchRecentOrders(), fetchAllOrders(), fetchRecentWorklogs()])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchRecentOrders, fetchAllOrders, fetchRecentWorklogs])

  const recentOrdersMetrics = useMemo(() => {
    if (recentOrders.length === 0) {
      return { totalQuantity: 0, totalWorkUnits: 0, completedCount: 0 }
    }

    const totalQuantity = recentOrders.reduce((sum, order) => sum + (order.productionQuantity || 0), 0)
    const totalWorkUnits = recentOrders.reduce((sum, order) => {
      if (!order.worklogs || order.worklogs.length === 0) return sum
      return sum + sumWorkUnits(order.worklogs as OrderWorklog[])
    }, 0)
    const completedCount = recentOrders.filter((order) => getOrderStatus(order) === 'completed').length

    return { totalQuantity, totalWorkUnits, completedCount }
  }, [recentOrders])

  const recentWorklogMetrics = useMemo(() => {
    if (recentWorklogs.length === 0) {
      return { totalHours: 0, uniqueOrders: 0 }
    }

    const totalHours = recentWorklogs.reduce((sum, worklog) => {
      const units = worklog.calculatedWorkUnits || 0
      return sum + units
    }, 0)
    const uniqueOrders = new Set(recentWorklogs.map((worklog) => worklog.orderId)).size

    return { totalHours, uniqueOrders }
  }, [recentWorklogs])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">驗證中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen logo-bg-animation flex flex-col">
      <LiquidGlassNav />

      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-6 floating-combined">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className={`liquid-glass-card liquid-glass-card-brand liquid-glass-card-interactive liquid-glass-card-refraction floating-shapes group ${QUICK_CARD_PADDING}`}>
            <div className="liquid-glass-content flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="icon-container icon-container-gradient-sunrise icon-micro-bounce">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="text-right space-y-1">
                  <h3 className="text-sm font-semibold text-indigo-600">新增配方</h3>
                  <p className="text-xs text-indigo-500/75">快速建立新配方記錄</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                建立新的膠囊配方記錄，包含原料配置與生產參數。
              </p>
              <div className="mt-auto">
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110">
                  <Link href="/orders/new">開始建立</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className={`liquid-glass-card liquid-glass-card-interactive liquid-glass-card-refraction floating-orbs group ${QUICK_CARD_PADDING}`}>
            <div className="liquid-glass-content flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="icon-container icon-container-gradient-emerald icon-micro-bounce">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div className="text-right space-y-1">
                  <h3 className="text-sm font-semibold text-emerald-600">生產記錄</h3>
                  <p className="text-xs text-emerald-500/70">支援搜尋篩選與編輯</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                檢視與管理所有生產訂單，掌握最新工時與進度。
              </p>
              <div className="mt-auto">
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110">
                  <Link href="/orders">查看記錄</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className={`rounded-2xl bg-white/65 border border-white/75 shadow-[0_4px_12px_rgba(15,32,77,0.1)] ${MINI_CARD_PADDING} space-y-3`}>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-500" />最近生產紀錄
                </h3>
                <p className="text-[11px] text-slate-500">最新 5 筆訂單</p>
              </div>
              <Link href="/orders" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                查看全部<ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const status = getOrderStatus(order)
                  const statusLabel = status === 'completed' ? '已完成' : status === 'inProgress' ? '進行中' : '未開始'
                  const latestWorklog = order.worklogs?.[order.worklogs.length - 1]

                  return (
                    <Link key={order.id} href={`/orders/${order.id}`} className="block">
                      <div className="rounded-xl bg-white/70 border border-white/80 px-3 py-2.5 hover:border-white/95 transition shadow-[0_4px_10px_rgba(15,32,77,0.08)]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-[0.14em]">
                              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" />
                              <span>更新 {formatDateOnly(order.createdAt)}</span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 truncate">{order.productName}</h4>
                            <p className="text-[11px] text-slate-500 truncate">客戶：{order.customerName}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold text-white ${status === 'completed' ? 'bg-emerald-600' : status === 'inProgress' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                            <Calendar className="h-3 w-3" />
                            {statusLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-600">
                          <span className="rounded-lg bg-white/80 border border-white/60 px-2 py-1">
                            <span className="text-slate-400 mr-1">訂單</span>
                            {formatNumber(order.productionQuantity)} 粒
                          </span>
                          <span className="rounded-lg bg-white/80 border border-white/60 px-2 py-1">
                            <span className="text-slate-400 mr-1">工時</span>
                            {order.worklogs && order.worklogs.length > 0 ? `${sumWorkUnits(order.worklogs as OrderWorklog[]).toFixed(1)}h` : '—'}
                          </span>
                          {order.customerService && (
                            <span className="rounded-lg bg-white/80 border border-white/60 px-2 py-1">
                              <span className="text-slate-400 mr-1">客服</span>
                              {order.customerService}
                            </span>
                          )}
                        </div>

                        {latestWorklog && (
                          <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 via-indigo-400/10 to-purple-500/12 border border-indigo-100 px-2 py-1.5 text-[10px] text-indigo-600 mt-2 flex items-center justify-between">
                            <span>最新工時</span>
                            <span>{formatWorklogDate(latestWorklog.workDate)} {latestWorklog.startTime}-{latestWorklog.endTime}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500">
                目前沒有最近的生產紀錄。
              </div>
            )}
          </div>

          <div className={`rounded-2xl bg-white/65 border border-white/75 shadow-[0_4px_12px_rgba(15,32,77,0.1)] ${MINI_CARD_PADDING} space-y-3`}>
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-indigo-500" />最近工時紀錄
                </h3>
                <p className="text-[11px] text-slate-500">最新 5 筆工時</p>
              </div>
              <Link href="/worklogs" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                查看全部<ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            ) : recentWorklogs.length > 0 ? (
              <div className="space-y-2">
                {recentWorklogs.map((worklog) => (
                  <div key={worklog.id} className="rounded-xl bg-white/70 border border-white/80 px-3 py-2.5 shadow-[0_4px_10px_rgba(15,32,77,0.08)]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase tracking-[0.14em]">
                          工時 {formatWorklogDate(worklog.workDate)}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{worklog.order?.productName || '未指派訂單'}</h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {worklog.order?.customerName ? `客戶：${worklog.order.customerName}` : '未指定客戶'}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold text-white bg-blue-600">
                        <Timer className="h-3 w-3" />
                        {(worklog.calculatedWorkUnits ?? 0).toFixed(1)} 工時
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-slate-600">
                      <span className="rounded-lg bg-white/80 border border-white/60 px-2 py-1">
                        <span className="text-slate-400 mr-1">負責人</span>
                        {'userName' in worklog && worklog.userName ? (worklog as any).userName : '未指定'}
                      </span>
                      {worklog.notes && (
                        <span className="rounded-lg bg-white/80 border border-white/60 px-2 py-1">
                          <span className="text-slate-400 mr-1">備註</span>
                          {worklog.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500">
                目前沒有最近的工時紀錄。
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white/60 border border-white/70 shadow-[0_6px_16px_rgba(15,32,77,0.1)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-container-gradient-sunrise">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">AI 工單助手</h3>
                <p className="text-xs text-slate-500">即時分析生產資訊</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              使用 AI 評估工單執行風險，提供生產建議與下批準備提醒。
            </p>
          </div>

          <div className="rounded-2xl bg-white/60 border border-white/70 shadow-[0_6px_16px_rgba(15,32,77,0.1)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-container-gradient-emerald">
                <FlaskConical className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">品質控管摘要</h3>
                <p className="text-xs text-slate-500">日常稽核快速檢視</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              監控生產過程中的關鍵品質指標，確保每批產品符合標準。
            </p>
          </div>

          <div className="rounded-2xl bg-white/60 border border-white/70 shadow-[0_6px_16px_rgba(15,32,77,0.1)] px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="icon-container icon-container-gradient-indigo">
                <ClipboardCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">工序檢查提醒</h3>
                <p className="text-xs text-slate-500">關鍵時間點通知</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              設定提醒節奏，提醒團隊完成保養、清潔等關鍵維護工序。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-white/60 border border-white/70 shadow-[0_6px_16px_rgba(15,32,77,0.1)] px-4 py-4 sm:px-5 sm:py-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-500" /> 生產指標摘要
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-center">
                <div className="text-[11px] text-slate-400">最近訂單</div>
                <div className="text-lg font-semibold text-slate-900">{recentOrders.length}</div>
              </div>
              <div className="rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-center">
                <div className="text-[11px] text-slate-400">累積工時</div>
                <div className="text-lg font-semibold text-slate-900">{recentOrdersMetrics.totalWorkUnits.toFixed(1)}h</div>
              </div>
              <div className="rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-center">
                <div className="text-[11px] text-slate-400">完成訂單</div>
                <div className="text-lg font-semibold text-slate-900">{recentOrdersMetrics.completedCount}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/60 border border-white/70 shadow-[0_6px_16px_rgba(15,32,77,0.1)] px-4 py-4 sm:px-5 sm:py-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-indigo-500" /> 工時分佈摘要
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-center">
                <div className="text-[11px] text-slate-400">總工時</div>
                <div className="text-lg font-semibold text-slate-900">{recentWorklogMetrics.totalHours.toFixed(1)}h</div>
              </div>
              <div className="rounded-xl bg-white/80 border border-white/70 px-3 py-2 text-center">
                <div className="text-[11px] text-slate-400">涉及訂單</div>
                <div className="text-lg font-semibold text-slate-900">{recentWorklogMetrics.uniqueOrders}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/60 border border-white/70 shadow-[0_6px_16px_rgba(15,32,77,0.1)] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" /> 最近訂單清單
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetchWithTimeout('/api/orders/export', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ format: 'csv', includeIngredients: true }),
                    })
                    if (!response.ok) {
                      throw new Error('匯出失敗')
                    }
                    const blob = await response.blob()
                    const fileUrl = URL.createObjectURL(blob)
                    downloadFile(fileUrl, `recent-orders-${DateTime.now().toFormat('yyyyMMdd')}.csv`)
                    URL.revokeObjectURL(fileUrl)
                  } catch (error) {
                    console.error('匯出最近訂單失敗:', error)
                  }
                }}
                className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50 transition"
              >
                匯出 CSV
              </button>
              <button
                type="button"
                onClick={() => setShowOrderDetails(false)}
                className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50 transition"
              >
                關閉詳情
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/70">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead>訂單</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>完工日期</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.slice(0, 5).map((order) => {
                  const status = getOrderStatus(order)
                  const statusLabel = status === 'completed' ? '已完成' : status === 'inProgress' ? '進行中' : '未開始'
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{order.productName}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white ${status === 'completed' ? 'bg-emerald-600' : status === 'inProgress' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                          {statusLabel}
                        </span>
                      </TableCell>
                      <TableCell>{order.completionDate ? formatDateOnly(order.completionDate) : '—'}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-700 text-xs"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderDetails(true)
                          }}
                        >
                          檢視詳情
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <LiquidGlassFooter />

      <LiquidGlassModal
        isOpen={showOrderDetails && Boolean(selectedOrder)}
        onClose={() => setShowOrderDetails(false)}
        title={selectedOrder ? `${selectedOrder.productName} 詳細資訊` : '訂單詳細'}
        size="lg"
      >
        {selectedOrder && <OrderDetailView order={selectedOrder} />}
      </LiquidGlassModal>
    </div>
  )
}
