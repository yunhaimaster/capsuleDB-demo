'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ResponsiveOrdersList } from '@/components/orders/responsive-orders-list'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    // 獲取訂單數據供 AI 助手使用
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders?limit=100')
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders || [])
        }
      } catch (error) {
        console.error('Error fetching orders for AI:', error)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen animated-gradient-bg-visible flex flex-col">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">
        <section className="liquid-glass-card liquid-glass-card-refraction liquid-glass-card-interactive p-6 md:p-8">
          <div className="liquid-glass-content flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="icon-container icon-container-cyan shadow-[0_12px_30px_rgba(34,211,238,0.25)]">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2v-2a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2m-1-12a3 3 0 01-6 0m6 0a3 3 0 10-6 0m6 0h3m-9 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg md:text-lg font-semibold text-[--brand-neutral] tracking-tight">生產訂單管理</h1>
                <p className="text-xs md:text-xs text-gray-600">掌握所有客戶訂單狀態、搜尋篩選與匯出報表</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-300/40 text-emerald-700">即時更新</span>
                <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-300/40 text-blue-700">資料匯出</span>
              </div>
              <Link href="/orders/new">
                <button className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-300/40 text-purple-700 text-xs font-medium hover:bg-purple-500/20 transition-colors duration-200">
                  + 新建訂單
                </button>
              </Link>
            </div>
          </div>
        </section>


      <ResponsiveOrdersList />
      
      {/* 智能 AI 助手 - 浮動按鈕 */}
      <SmartAIAssistant 
        orders={orders} 
        pageData={{
          currentPage: '/orders',
          pageDescription: '生產記錄管理頁面 - 查看和管理所有膠囊生產訂單',
          timestamp: new Date().toISOString(),
          ordersCount: orders.length,
          hasCurrentOrder: false,
          currentOrder: null,
          recentOrders: orders.slice(0, 5)
        }}
      />
      </div>

      {/* Footer */}
      <LiquidGlassFooter />
    </div>
  )
}
