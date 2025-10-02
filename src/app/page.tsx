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
import { Plus, FileText, Eye, Download, Brain, ClipboardList, Calendar, Zap, FlaskConical, ClipboardCheck } from 'lucide-react'
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
              <div className="icon-container icon-container-gradient-sunrise group-hover:scale-110 transition-transform duration-300 icon-micro-bounce">
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
              <div className="icon-container icon-container-gradient-emerald group-hover:scale-110 transition-transform duration-300 icon-micro-bounce">
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

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <div className="liquid-glass-card liquid-glass-card-interactive floating-dots">
          <div className="liquid-glass-content">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg md:text-lg font-semibold flex items-center mb-2">
                <FileText className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 text-cyan-600" />
                最近生產紀錄
              </h3>
              <p className="text-xs sm:text-sm md:text-sm opacity-80">
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
              <h3 className="text-lg md:text-lg font-semibold text-emerald-800 flex items-center mb-2">
                <span className="mr-2">📚</span>
                參考資料下載
              </h3>
              <p className="text-sm md:text-sm text-emerald-600 opacity-80">
                行業相關培訓資料和風險管控指南
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* 風險原料清單 */}
              <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-refraction h-full">
                <div className="liquid-glass-content flex h-full flex-col">
                  <div className="flex items-start gap-4">
                    <div className="icon-container icon-container-indigo">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="text-base font-semibold text-[--brand-neutral] leading-tight">
                        保健品行業常見生產風險原料清單
                      </h4>
                      <p className="text-sm md:text-sm text-indigo-600/90">
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
                    <div className="icon-container icon-container-teal">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h4 className="text-base font-semibold text-[--brand-neutral] leading-tight">
                        膠囊生產培訓手冊
                      </h4>
                      <p className="text-sm md:text-sm text-teal-600/90">
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
            <div className="liquid-glass-card liquid-glass-card-interactive hover:scale-105 transition-transform cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-violet mx-auto mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">AI 配方生成器</h3>
                <p className="text-sm text-gray-600 mb-4">
                  使用人工智能技術，根據目標功效自動生成專業膠囊配方
                </p>
                <div className="inline-flex items-center text-violet-600 text-sm font-medium">
                  開始使用 →
                </div>
              </div>
            </div>
          </Link>

          {/* 製粒分析工具 */}
          <Link href="/granulation-analyzer">
            <div className="liquid-glass-card liquid-glass-card-interactive liquid-glass-card-refraction hover:scale-105 transition-transform cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-emerald-light mx-auto mb-4">
                  <FlaskConical className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">製粒分析工具</h3>
                <p className="text-sm text-gray-600 mb-4">
                  智能評估膠囊配方是否需要製粒，多模型專業建議
                </p>
                <div className="inline-flex items-center text-emerald-600 text-sm font-medium">
                  開始分析 →
                </div>
              </div>
            </div>
          </Link>

          {/* 工作單生成 */}
          <Link href="/work-orders">
            <div className="liquid-glass-card liquid-glass-card-interactive liquid-glass-card-refraction hover:scale-105 transition-transform cursor-pointer">
              <div className="liquid-glass-content text-center">
                <div className="icon-container icon-container-gradient-rose mx-auto mb-4">
                  <ClipboardCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">工作單生成</h3>
                <p className="text-sm text-gray-600 mb-4">
                  自動生成符合 ISO 標準的生產工作單和質量控制文件
                </p>
                <div className="inline-flex items-center text-rose-600 text-sm font-medium">
                  生成工作單 →
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
                    <span className="text-[11px] text-amber-600">更新：2025/10/02</span>
                  </div>
                  <ul className="space-y-1 text-xs md:text-sm text-amber-700">
                    <li>• Grok AI 回歸製粒分析，輸出更聰明、語氣更活潑</li>
                    <li>• 訂單 AI 助手 Modal 再強化，無論桌面或手機都穩定浮在內容上方</li>
                    <li>• 新增「隱私政策」與「服務條款」頁面，Footer 連結正式生效</li>
                    <li>• Footer 年份調整至 2025，細節同步最新進度</li>
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
                    <h4 className="font-medium text-green-800 text-sm sm:text-base">v2.2.0 - 2025年10月2日</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full self-start sm:self-auto">最新版本</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-green-700">
                    <li>Grok AI 回歸，製粒分析輸出更自然、更懂香港語氣</li>
                    <li>訂單 AI 助手 Modal 重寫疊層，任何裝置都穩定顯示</li>
                    <li>新增隱私政策與服務條款頁面，安心查閱資訊</li>
                    <li>Footer 版面同步 2025 年度細節，細節再升級</li>
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