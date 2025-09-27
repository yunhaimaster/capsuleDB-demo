'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { Logo } from '@/components/ui/logo'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { Plus, FileText, Eye } from 'lucide-react'
import { formatDate, formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { ProductionOrder } from '@/types'
import Link from 'next/link'

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
            <p><span className="font-medium">建檔人員：</span>{order.createdBy || '系統'}</p>
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
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)

  useEffect(() => {
    fetchRecentOrders()
    fetchAllOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      // 使用與生產紀錄管理頁相同的排序邏輯：未完工優先，已完工按日期排序
      const response = await fetch('/api/orders?limit=5&sortBy=completionDate&sortOrder=desc')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders || [])
      }
    } catch (error) {
      console.error('載入最近訂單錯誤:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllOrders = async () => {
    try {
      // 獲取所有訂單，使用相同的排序邏輯：未完工優先，已完工按日期排序
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
  }

  return (
    <div className="min-h-screen animated-gradient-bg-subtle">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁', active: true },
          { href: '/orders', label: '訂單管理' },
          { href: '/production-order-form', label: '新建訂單' }
        ]}
        ctaText="新建訂單"
        ctaHref="/production-order-form"
      />

      {/* Main Content with padding for fixed nav */}
      <div className="pt-20 space-y-8 floating-combined">
      {/* Header Section */}
      <div className="floating-particles bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 dark:from-brand-primary/10 dark:to-brand-secondary/10 rounded-xl p-4 sm:p-6 md:p-8 border dark:border-brand-primary/20 shadow-lg">
        <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
          <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent leading-tight">
            Easy Health 膠囊配方管理系統
          </h1>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
            專業的膠囊配方生產管理平台，提供完整的生產記錄追蹤與智能分析功能
          </p>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-interactive liquid-glass-card-refraction floating-shapes group">
          <div className="liquid-glass-content">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-2 md:p-3 bg-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-300 icon-micro-bounce">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-indigo-700">新增配方</h3>
                <p className="text-xs sm:text-sm md:text-base text-indigo-600">建立新記錄</p>
              </div>
            </div>
            <p className="text-xs sm:text-xs md:text-sm mb-3 sm:mb-3 md:mb-4 leading-relaxed opacity-90">
              建立新的膠囊配方記錄，包含原料配置與生產參數
            </p>
            <Link href="/orders/new">
              <Button className="ripple-effect btn-micro-hover micro-brand-glow w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base py-2 sm:py-2 md:py-3">
                開始建立
              </Button>
            </Link>
          </div>
        </div>

        <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-interactive liquid-glass-card-refraction floating-orbs group">
          <div className="liquid-glass-content">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-2 md:p-3 bg-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300 icon-micro-bounce">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-emerald-700">生產記錄</h3>
                <p className="text-xs sm:text-sm md:text-base text-emerald-600">檢視管理</p>
              </div>
            </div>
            <p className="text-xs sm:text-xs md:text-sm mb-3 sm:mb-3 md:mb-4 leading-relaxed opacity-90">
              檢視與管理所有生產記錄，支援搜尋、篩選與編輯
            </p>
            <Link href="/orders">
              <Button className="ripple-effect btn-micro-hover micro-brand-glow w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base py-2 sm:py-2 md:py-3">
                查看記錄
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
          <div className="liquid-glass-content">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold flex items-center mb-2">
                <FileText className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
                最近生產紀錄
              </h3>
              <p className="text-xs sm:text-sm md:text-base opacity-80">
                最新的生產訂單狀態
              </p>
            </div>
            <div className="space-y-3">
            {loading ? (
              <div className="space-y-3 skeleton-stagger">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text-sm"></div>
                <div className="skeleton skeleton-text-sm"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link href={`/orders/${order.id}`} key={order.id} className="block">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors liquid-glass-card-interactive">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{order.customerName} - {order.productName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">數量: {formatNumber(order.productionQuantity)} 粒</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{order.completionDate ? '已完工' : '進行中'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">目前沒有最近的生產記錄。</p>
                <Link href="/orders/new">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    建立第一筆記錄
                  </Button>
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* 功能介紹 */}
        <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
          <div className="liquid-glass-content">
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-amber-800 dark:text-amber-200 flex items-center mb-2">
                <span className="mr-2">📋</span>
                功能介紹
              </h3>
              <p className="text-sm md:text-base text-amber-600 dark:text-amber-200 opacity-80">
                系統功能說明與使用指南
              </p>
            </div>
            <div className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/40 p-3 md:p-4 rounded-xl border border-amber-200 dark:border-amber-700/50">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">主要功能</h4>
                <ul className="space-y-1 text-xs md:text-sm text-amber-700 dark:text-amber-100">
                  <li>• 膠囊配方管理與記錄追蹤</li>
                  <li>• 智能配方導入（文字/圖片解析）</li>
                  <li>• AI 助手分析與專業建議</li>
                  <li>• 響應式設計，完美支援手機與桌面</li>
                  <li>• 深色模式與淺色模式切換</li>
                  <li>• 動態漸變背景與浮動元素</li>
                  <li>• 玻璃擬態卡片與微動畫效果</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/40 p-3 md:p-4 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">技術支援</h4>
                <div className="text-xs md:text-sm text-yellow-700 dark:text-yellow-100">
                  <p className="mb-1">如有任何問題或建議，請聯繫：</p>
                  <p className="font-medium">Victor</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-200 mt-1">系統管理員</p>
                </div>
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
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800 dark:text-blue-200 flex items-center mb-2">
                <span className="mr-2 text-sm sm:text-base">📝</span>
                版本更新記錄
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-blue-600 dark:text-blue-200 opacity-80">
                系統功能更新與改進記錄
              </p>
            </div>
            <div className="space-y-4">
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/40 p-3 rounded-xl border border-green-200 dark:border-green-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h4 className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">v1.0.7 - 2024年12月19日</h4>
                  <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full self-start sm:self-auto">最新版本</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-green-700 dark:text-green-100">
                  <li>• 引入 Liquid Glass Cards，提升 UI 質感與互動性</li>
                  <li>• 解決 Vercel 部署中 Prisma Schema 與環境變量問題</li>
                  <li>• 修正 AI API 密鑰配置，確保 AI 助手正常運作</li>
                  <li>• 優化數據庫遷移流程，確保 `isCustomerProvided` 字段正確同步</li>
                  <li>• 移除原料配方中的「顯示計算」和「複製配方」按鈕</li>
                  <li>• 更新 Order AI 初始問題，提供膠囊配方專業分析</li>
                  <li>• 修正 Smart AI 初始問題被 Order AI 覆蓋的問題</li>
                  <li>• 完工日期只顯示日期，不記錄時間</li>
                  <li>• 解決訂單列表「下一頁」按鈕無效問題</li>
                  <li>• 修正 AI 按鈕與提交按鈕重疊問題</li>
                  <li>• 引入動畫漸變背景、玻璃擬態卡片、增強加載狀態、微動畫和浮動元素</li>
                  <li>• 深色模式與淺色模式切換功能</li>
                  <li>• AI 翻譯功能：簡體中文轉繁體中文</li>
                  <li>• 手機介面優化與觸控體驗改善</li>
                  <li>• 膠囊規格管理：支援顏色、大小、成分選擇</li>
                </ul>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* 智能 AI 助手 */}
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
    </div>
  )
}