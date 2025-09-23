'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { OrderAIAssistant } from '@/components/ai/order-ai-assistant'
import { InteractiveHero } from '@/components/ui/interactive-hero'
import { Plus, FileText, Eye } from 'lucide-react'
import { formatDate, formatDateOnly, formatNumber, convertWeight, calculateBatchWeight } from '@/lib/utils'
import { ProductionOrder } from '@/types'
import Link from 'next/link'

export default function HomePage() {
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([])
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    fetchRecentOrders()
    fetchAllOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAllOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching all orders:', error)
    }
  }

  const handleReveal = () => {
    setShowContent(true)
  }

  return (
    <div className="min-h-screen">
      {!showContent ? (
        <InteractiveHero onReveal={handleReveal} />
      ) : (
        <div className="space-y-8 p-4">
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
                    <CardDescription className="text-xs sm:text-sm md:text-base text-emerald-600">查看記錄</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-xs md:text-sm text-gray-600 mb-3 sm:mb-3 md:mb-4 leading-relaxed">
                  查看和管理所有生產記錄，支援搜尋、篩選與排序功能
                </p>
                <Link href="/orders">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base py-2 sm:py-2 md:py-3">
                    查看記錄
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* 最近活動 */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 dark:border-slate-700/30">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700 dark:text-slate-300">
                <FileText className="mr-2 h-5 w-5" />
                最近生產記錄
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                最新的生產記錄，點擊查看詳情
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-sm text-muted-foreground">載入中...</p>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">尚無生產記錄</p>
                  <Link href="/orders/new">
                    <Button className="mt-4">建立第一筆記錄</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-lg border dark:border-slate-700/30 hover:shadow-md transition-shadow">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-sm font-medium">#{order.id}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {order.customerName} - {order.productName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatNumber(order.productionQuantity)} 粒 • {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Eye className="mr-1 h-3 w-3" />
                              查看
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>生產記錄詳情</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">客戶名稱</label>
                                  <p className="text-sm">{order.customerName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">產品名字</label>
                                  <p className="text-sm">{order.productName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">生產數量</label>
                                  <p className="text-sm">{formatNumber(order.productionQuantity)} 粒</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">單粒總重量</label>
                                  <p className="text-sm">{order.unitWeightMg.toFixed(3)} mg</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">批次總重量</label>
                                  <p className="text-sm">{convertWeight(order.batchTotalWeightMg).display}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">完工日期</label>
                                  <p className="text-sm">{order.completionDate ? formatDate(order.completionDate) : '未完工'}</p>
                                </div>
                              </div>
                              
                              {order.processIssues && (
                                <div>
                                  <label className="text-sm font-medium">製程問題記錄</label>
                                  <p className="text-sm bg-red-50 p-3 rounded border border-red-200">{order.processIssues}</p>
                                </div>
                              )}
                              
                              {order.qualityNotes && (
                                <div>
                                  <label className="text-sm font-medium">品管備註</label>
                                  <p className="text-sm bg-blue-50 p-3 rounded border border-blue-200">{order.qualityNotes}</p>
                                </div>
                              )}
                            </div>
                            
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
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI 助手 */}
          <div className="text-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="mr-2 h-5 w-5" />
                  啟動 AI 智能助手
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>EasyPack AI 智能助手</DialogTitle>
                </DialogHeader>
                <SmartAIAssistant 
                  orders={allOrders} 
                  pageData={{
                    currentPage: '/',
                    pageDescription: '首頁 - EasyPack 膠囊配方管理系統主頁',
                    timestamp: new Date().toISOString(),
                    ordersCount: allOrders.length,
                    hasCurrentOrder: false,
                    currentOrder: null,
                    recentOrders: recentOrders
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}