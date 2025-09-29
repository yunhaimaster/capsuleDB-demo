'use client'

import { useState, useEffect } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { WorkOrderRequest, WorkOrderResponse } from '@/types/v2-types'
import { FileText, Loader2, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import Link from 'next/link'

interface ProductionOrder {
  id: string
  customerName: string
  productName: string
  productionQuantity: number
  createdAt: string
}

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkOrder, setGeneratedWorkOrder] = useState<WorkOrderResponse['workOrder'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isoStandard, setIsoStandard] = useState('ISO 9001')

  // 獲取訂單列表
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        }
      } catch (err) {
        console.error('獲取訂單列表失敗:', err)
      }
    }
    fetchOrders()
  }, [])

  const handleGenerate = async () => {
    if (!selectedOrderId) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/work-orders/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          isoStandard,
          enableReasoning: false
        }),
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedWorkOrder(result.workOrder)
      } else {
        setError(result.error || '工作單生成失敗')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedWorkOrder?.content) {
      const blob = new Blob([generatedWorkOrder.content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `工作單-${generatedWorkOrder.orderNumber}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const selectedOrder = orders.find(order => order.id === selectedOrderId)

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📋 ISO 工作單生成器
            </h1>
            <p className="text-lg text-gray-600">
              自動生成符合 ISO 標準的生產工作單和質量控制文件
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側：訂單選擇 */}
            <div className="lg:col-span-1">
              <Card className="liquid-glass-card liquid-glass-card-elevated mb-6">
                <div className="liquid-glass-content">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="icon-container icon-container-purple">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">選擇訂單</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        選擇要生成工作單的訂單
                      </label>
                      <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">請選擇訂單...</option>
                        {orders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.productName} - {order.customerName} ({order.productionQuantity}粒)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedOrder && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">訂單詳情</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">產品名稱:</span> {selectedOrder.productName}</p>
                          <p><span className="font-medium">客戶:</span> {selectedOrder.customerName}</p>
                          <p><span className="font-medium">數量:</span> {selectedOrder.productionQuantity.toLocaleString()} 粒</p>
                          <p><span className="font-medium">建檔日期:</span> {new Date(selectedOrder.createdAt).toLocaleDateString('zh-TW')}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ISO 標準
                      </label>
                      <select
                        value={isoStandard}
                        onChange={(e) => setIsoStandard(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="ISO 9001">ISO 9001:2015</option>
                        <option value="ISO 22000">ISO 22000:2018</option>
                        <option value="ISO 13485">ISO 13485:2016</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedOrderId}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          生成工作單
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 功能說明 */}
              <Card className="liquid-glass-card liquid-glass-card-elevated">
                <div className="liquid-glass-content">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">功能說明</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>自動生成符合 ISO 標準的工作單</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>包含完整的生產步驟和質量控制點</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>風險評估和緩解措施</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>支持多種 ISO 標準</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 右側：生成結果 */}
            <div className="lg:col-span-2">
              {/* 錯誤提示 */}
              {error && (
                <Card className="liquid-glass-card liquid-glass-card-warning mb-6">
                  <div className="liquid-glass-content">
                    <div className="flex items-center space-x-3">
                      <div className="icon-container icon-container-red">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* 生成中狀態 */}
              {isGenerating && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="text-center py-12">
                      <div className="icon-container icon-container-purple mx-auto mb-6">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        📋 AI 正在生成工作單...
                      </h3>
                      <div className="space-y-3 text-gray-600">
                        <p>正在分析訂單信息...</p>
                        <div className="flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <p className="text-sm">這可能需要 20-60 秒，請耐心等待...</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 生成結果 */}
              {generatedWorkOrder && !isGenerating && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="icon-container icon-container-green">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">生成的工作單</h2>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>下載</span>
                        </Button>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <MarkdownRenderer content={generatedWorkOrder.content} />
                    </div>

                    {/* 免責條款 */}
                    <div className="mt-6">
                      <AIDisclaimer type="general" />
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">工作單號:</span>
                          <span className="ml-2 text-gray-800">{generatedWorkOrder.orderNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">產品名稱:</span>
                          <span className="ml-2 text-gray-800">{generatedWorkOrder.orderNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">批次大小:</span>
                          <span className="ml-2 text-gray-800">{selectedOrder?.productionQuantity.toLocaleString()} 粒</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">生成時間:</span>
                          <span className="ml-2 text-gray-800">
                            {new Date(generatedWorkOrder.generatedAt).toLocaleString('zh-TW')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* 使用說明 */}
              {!generatedWorkOrder && !error && (
                <Card className="liquid-glass-card liquid-glass-card-elevated">
                  <div className="liquid-glass-content">
                    <div className="text-center py-12">
                      <div className="icon-container icon-container-gray mx-auto mb-4">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        生成 ISO 工作單
                      </h3>
                      <p className="text-gray-600 mb-6">
                        選擇訂單並選擇 ISO 標準，系統將自動生成符合規範的工作單
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>生產步驟</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>質量控制</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>風險評估</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 公司信息 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Easy Health</h3>
              <p className="text-gray-400 text-sm mb-4">
                專業的保健品膠囊生產管理解決方案
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💊</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏭</span>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
            </div>

            {/* 主要功能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">主要功能</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/orders" className="hover:text-white transition-colors">訂單管理</Link></li>
                <li><Link href="/ai-recipe-generator" className="hover:text-white transition-colors">AI 配方生成</Link></li>
                <li><Link href="/work-orders" className="hover:text-white transition-colors">工作單生成</Link></li>
                <li><Link href="/reports" className="hover:text-white transition-colors">原料報表</Link></li>
              </ul>
            </div>

            {/* 系統功能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">系統功能</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/history" className="hover:text-white transition-colors">歷史記錄</Link></li>
                <li><Link href="/liquid-glass-demo" className="hover:text-white transition-colors">UI 演示</Link></li>
                <li><Link href="/orders/new" className="hover:text-white transition-colors">新建訂單</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">登入系統</Link></li>
              </ul>
            </div>

            {/* 技術支援 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">技術支援</h3>
              <div className="text-sm text-gray-400">
                <p className="mb-2">系統管理員：Victor</p>
                <p className="mb-2">版本：v2.0</p>
                <p className="mb-4">最後更新：2025年9月29日</p>
                <div className="flex space-x-2">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">在線</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">AI 驅動</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Easy Health 膠囊管理系統. 保留所有權利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
