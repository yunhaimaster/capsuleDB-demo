'use client'

import { useState, useEffect } from 'react'
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
import { Plus, FileText, Eye, Download, Brain, ClipboardList, Calendar, Zap } from 'lucide-react'
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

// 移除本地Footer組件，使用統一的LiquidGlassFooter

export default function HomePage() {
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([])
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
    <div className="min-h-screen brand-logo-bg-animation">
      {/* Liquid Glass Navigation */}
        <LiquidGlassNav 
          links={[
            { href: '/', label: '首頁', active: true },
            { href: '/orders', label: '訂單' },
            { href: '/orders/new', label: '新建' },
            { href: '/ai-recipe-generator', label: 'AI 配方' },
            { href: '/work-orders', label: '工作單' },
            { href: '/login?logout=true', label: '登出' }
          ]}
        />

      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors liquid-glass-card-interactive">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.customerName} - {order.productName}</p>
                        <p className="text-xs text-gray-500">數量: {formatNumber(order.productionQuantity)} 粒</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{order.completionDate ? formatDateOnly(order.completionDate) : '未完工'}</p>
                        <p className="text-xs text-gray-500">{order.completionDate ? '已完工' : '進行中'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
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
        </div>

        {/* PDF 參考資料下載 */}
        <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
          <div className="liquid-glass-content">
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-blue-800 flex items-center mb-2">
                <span className="mr-2">📚</span>
                參考資料下載
              </h3>
              <p className="text-sm md:text-base text-blue-600 opacity-80">
                行業相關培訓資料和風險管控指南
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* 風險原料清單 */}
              <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-refraction h-full">
                <div className="liquid-glass-content flex h-full flex-col">
                  <div className="flex items-start gap-4">
                    <div className="icon-container icon-container-blue">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="text-lg font-semibold text-[--brand-neutral] leading-tight">
                        保健品行業常見生產風險原料清單
                      </h4>
                      <p className="text-sm md:text-base text-blue-600/90">
                        行業風險管控參考資料
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6">
                    <Button
                      asChild
                      size="lg"
                      className="w-full text-white shadow-[0_18px_38px_rgba(41,102,146,0.18)] border-none"
                      style={{ background: 'var(--brand-gradient-primary)' }}
                    >
                      <a href="/pdf/保健品行業常見生產風險原料清單.pdf" download>
                        <span className="flex items-center justify-center gap-2 text-base">
                          <Download className="w-4 h-4" />
                          下載 PDF
                        </span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 培訓手冊 */}
              <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-refraction h-full">
                <div className="liquid-glass-content flex h-full flex-col">
                  <div className="flex items-start gap-4">
                    <div className="icon-container icon-container-green">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="text-lg font-semibold text-[--brand-neutral] leading-tight">
                        膠囊生產培訓手冊
                      </h4>
                      <p className="text-sm md:text-base text-emerald-600/90">
                        香港版修訂版
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6">
                    <Button
                      asChild
                      size="lg"
                      variant="secondary"
                      className="w-full bg-green-500 hover:bg-green-600 text-white shadow-[0_18px_38px_rgba(34,197,94,0.18)] border-none"
                    >
                      <a href="/pdf/膠囊生產培訓手冊（香港版-修訂版）.pdf" download>
                        <span className="flex items-center justify-center gap-2 text-base">
                          <Download className="w-4 h-4" />
                          下載 PDF
                        </span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* v2.0 新功能區塊 */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            🚀 v2.0 全新功能
          </h2>
          <p className="text-gray-600">
            人工智能驅動的膠囊配方管理系統
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* AI 配方生成器 */}
          <Link href="/ai-recipe-generator">
            <div className="liquid-glass-card liquid-glass-card-interactive hover:scale-105 transition-transform cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-blue mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 配方生成器</h3>
                <p className="text-sm text-gray-600 mb-4">
                  使用人工智能技術，根據目標功效自動生成專業膠囊配方
                </p>
                <div className="inline-flex items-center text-blue-600 text-sm font-medium">
                  開始使用 →
                </div>
              </div>
            </div>
          </Link>

          {/* 工作單生成 */}
          <Link href="/work-orders">
            <div className="liquid-glass-card liquid-glass-card-interactive hover:scale-105 transition-transform cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-purple mx-auto mb-4">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">工作單生成</h3>
                <p className="text-sm text-gray-600 mb-4">
                  自動生成符合 ISO 標準的生產工作單和質量控制文件
                </p>
                <div className="inline-flex items-center text-purple-600 text-sm font-medium">
                  生成工作單 →
                </div>
              </div>
            </div>
          </Link>

          {/* 開發中功能 */}
          <div className="liquid-glass-card liquid-glass-card-interactive opacity-60 cursor-not-allowed">
            <div className="liquid-glass-content text-center">
              <div className="icon-container icon-container-gray mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">更多功能</h3>
              <p className="text-sm text-gray-600 mb-4">
                更多實用功能正在開發中，敬請期待
              </p>
              <div className="inline-flex items-center text-gray-500 text-sm font-medium">
                開發中...
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 功能介紹和版本更新 - 並排布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 功能介紹 */}
          <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
            <div className="liquid-glass-content">
              <div className="mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-amber-800 flex items-center mb-2">
                  <span className="mr-2">📋</span>
                  功能介紹
                </h3>
                <p className="text-sm md:text-base text-amber-600 opacity-80">
                  系統功能說明與使用指南
                </p>
              </div>
              <div className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <div className="bg-amber-50 p-3 md:p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-amber-800">v2.1 功能導覽</h4>
                    <span className="text-[11px] text-amber-600">更新：2025/09/30</span>
                  </div>
                  <ul className="space-y-1 text-xs md:text-sm text-amber-700">
                    <li>• 🤖 AI 助手全新對話介面與閱讀體驗</li>
                    <li>• 🧠 智能回覆建議與批次操作更直覺</li>
                    <li>• 📊 下載中心玻璃卡片改版、排版更工整</li>
                    <li>• 🔐 導航及登入狀態顯示一致化</li>
                  </ul>
                </div>
                <div className="bg-amber-50 p-3 md:p-4 rounded-xl border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-2">基礎功能</h4>
                  <ul className="space-y-1 text-xs md:text-sm text-amber-700">
                    <li>• 膠囊配方管理與記錄追蹤</li>
                    <li>• 智能配方導入（支援文字格式）</li>
                    <li>• AI 助手提供專業分析和建議</li>
                    <li>• 支援手機、平板和電腦使用</li>
                    <li>• 現代化玻璃質感介面設計</li>
                    <li>• 流暢的動畫效果</li>
                    <li>• 直觀易用的操作介面</li>
                    <li>• 品牌形象動態背景</li>
                    <li>• 優化的用戶操作體驗</li>
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
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-800 flex items-center mb-2">
                  <span className="mr-2 text-sm sm:text-base">📝</span>
                  最新版本更新
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-blue-600 opacity-80">
                  系統功能更新與改進記錄
                </p>
              </div>
              <div className="space-y-4">
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h4 className="font-medium text-green-800 text-sm sm:text-base">v2.1.0 - 2025年9月30日</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full self-start sm:self-auto">最新版本</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-green-700">
                    <li>AI 助手 Modal 全面升級，閱讀體驗與操作一致</li>
                    <li>PDF 下載卡片玻璃化改版，桌面/手機排版調整</li>
                    <li>導航列品牌名稱全裝置顯示，強化辨識</li>
                    <li>Footer 帳戶連結自動顯示登入/登出狀態</li>
                    <li>登入頁、編輯頁布局微調，與全站統一</li>
                    <li>新增品牌設計 Token 表，利於跨團隊協作</li>
                    <li>整合 confirm modal 視覺，打造 iOS Liquid Glass 效果</li>
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