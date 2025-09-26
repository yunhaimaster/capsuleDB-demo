'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { Plus, FileText, Eye } from 'lucide-react'
import { formatDate, formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { ProductionOrder } from '@/types'
import Link from 'next/link'

export default function HomePage() {
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([])
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)

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
      const response = await fetch('/api/orders?limit=1000&sortBy=completionDate&sortOrder=desc')
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 sm:p-6 md:p-8 border dark:border-purple-800/30">
        <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-2 sm:mb-3 md:mb-4">
            <span className="text-base sm:text-lg md:text-xl">🏠</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            EasyPack 膠囊配方管理系統
          </h1>
          <p className="text-xs sm:text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
            專業的膠囊配方生產管理平台，提供完整的生產記錄追蹤與智能分析功能
          </p>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 dark:from-indigo-900/20 dark:to-indigo-800/20 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30 dark:border-indigo-800/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-2 md:p-3 bg-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-indigo-700">新增配方</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base text-indigo-600">建立新記錄</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 mb-3 sm:mb-3 md:mb-4 leading-relaxed">
              建立新的膠囊配方記錄，包含原料配置與生產參數
            </p>
            <Link href="/orders/new">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base py-2 sm:py-2 md:py-3">
                開始建立
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30 dark:border-emerald-800/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="p-2 sm:p-2 md:p-3 bg-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="text-right">
                <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-emerald-700">生產記錄</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base text-emerald-600">檢視管理</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs sm:text-xs md:text-sm text-gray-600 mb-3 sm:mb-3 md:mb-4 leading-relaxed">
              檢視與管理所有生產記錄，支援搜尋、篩選與編輯
            </p>
            <Link href="/orders">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base py-2 sm:py-2 md:py-3">
                查看記錄
              </Button>
            </Link>
          </CardContent>
        </Card>


      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 dark:border-slate-700/30">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              <FileText className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 text-blue-600" />
              最近生產紀錄
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">
              最新的生產訂單狀態
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">載入中...</div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {order.customerName}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {order.productName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatNumber(order.productionQuantity)} 粒
                        </span>
                        {order.capsuleSize && order.capsuleColor && order.capsuleType && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                            {[order.capsuleSize, order.capsuleColor, order.capsuleType].filter(Boolean).join('')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {order.completionDate ? (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                          ✓ 完工 {formatDateOnly(order.completionDate)}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded">
                          ⏳ 未完工
                        </span>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-3 w-3" />
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
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/orders">
                    <Button variant="outline" className="w-full text-sm">
                      查看所有記錄
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">尚無生產記錄</div>
                <Link href="/orders/new">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    建立第一筆記錄
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 dark:border-amber-800/30">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl font-semibold text-amber-800 dark:text-amber-200 flex items-center">
              <span className="mr-2">📋</span>
              功能介紹
            </CardTitle>
            <CardDescription className="text-sm md:text-base text-amber-600 dark:text-amber-200">
              系統功能說明與使用指南
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/40 p-3 md:p-4 rounded-xl border border-amber-200 dark:border-amber-700/50">
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">主要功能</h4>
                <ul className="space-y-1 text-xs md:text-sm text-amber-700 dark:text-amber-100">
                  <li>• 膠囊配方管理與記錄追蹤</li>
                  <li>• 生產訂單狀態管理與品質控制</li>
                  <li>• 智能 AI 助手分析與建議</li>
                  <li>• 響應式設計，支援手機與桌面</li>
                  <li>• 深色模式與淺色模式切換</li>
                  <li>• 數據導出與備份功能</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/40 p-3 md:p-4 rounded-xl border border-orange-200 dark:border-orange-700/50">
                <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">使用流程</h4>
                <ol className="space-y-1 text-xs md:text-sm text-orange-700 dark:text-orange-100">
                  <li>1. 新增配方：建立新的膠囊生產訂單與配方</li>
                  <li>2. 檢視記錄：查看和管理現有膠囊訂單</li>
                  <li>3. 品質追蹤：記錄膠囊製程問題和備註</li>
                  <li>4. AI 分析：使用智能助手分析生產數據</li>
                  <li>5. 數據導出：匯出 CSV 格式的生產記錄</li>
                </ol>
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
          </CardContent>
        </Card>

        {/* 版本更新記錄 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-800/30">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-blue-800 dark:text-blue-200 flex items-center">
              <span className="mr-2 text-sm sm:text-base">📝</span>
              版本更新記錄
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base text-blue-600 dark:text-blue-200">
              系統功能更新與改進記錄
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/40 p-3 rounded-xl border border-blue-200 dark:border-blue-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">v1.0.6 - 2024年9月25日</h4>
                  <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full self-start sm:self-auto">最新版本</span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm text-blue-700 dark:text-blue-100 space-y-1">
                  <p className="text-xs sm:text-xs md:text-sm">🚀 <strong>AI 模型升級與錯誤處理優化</strong></p>
                  <ul className="ml-3 sm:ml-4 space-y-1 text-xs sm:text-xs md:text-sm leading-relaxed">
                    <li>• 升級 AI 模型至 DeepSeek Chat v3.1，提升回答質量</li>
                    <li>• 改善錯誤處理：提供重試選項而非要求聯繫技術支援</li>
                    <li>• 優化 AI 助手用戶體驗：智能重試功能和友善錯誤訊息</li>
                    <li>• 修復 TypeScript 編譯錯誤，確保部署成功</li>
                    <li>• 統一所有 AI 相關組件的錯誤處理邏輯</li>
                    <li>• 更新網站文案：移除 GPT-4 相關引用，反映最新技術</li>
                    <li>• 增強 AI 助手穩定性與可靠性</li>
                  </ul>
                </div>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-xl border border-indigo-200 dark:border-indigo-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h4 className="font-medium text-indigo-800 dark:text-indigo-200 text-sm sm:text-base">v1.0.2 - 2024年9月22日</h4>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full self-start sm:self-auto">穩定版本</span>
                </div>
                <div className="text-xs sm:text-xs md:text-sm text-indigo-700 dark:text-indigo-100 space-y-1">
                  <p className="text-xs sm:text-xs md:text-sm">🤖 <strong>AI 升級</strong></p>
                  <ul className="ml-3 sm:ml-4 space-y-1 text-xs sm:text-xs md:text-sm leading-relaxed">
                    <li>• 智能 AI 助手全面升級，支援基於回答內容的動態建議問題</li>
                    <li>• 新增響應式設計，完美支援手機與桌面設備</li>
                    <li>• 深色模式與淺色模式切換功能</li>
                    <li>• AI 翻譯功能：簡體中文轉繁體中文</li>
                    <li>• 手機介面優化與觸控體驗改善</li>
                    <li>• 膠囊規格管理：支援顏色、大小、成分選擇</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
    </div>
  )
}

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
                {order.capsuleType && <p><span className="font-medium">成份：</span>{order.capsuleType}</p>}
              </div>
            )}
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
    </div>
  )
}