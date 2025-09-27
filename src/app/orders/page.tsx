'use client'

import { useState, useEffect } from 'react'
import { OrdersList } from '@/components/orders/orders-list'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-screen animated-gradient-bg-subtle">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單管理' },
          { href: '/orders/new', label: '新建訂單' }
        ]}
        ctaText="登出"
        ctaHref="/login"
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-20 px-4 sm:px-6 md:px-8 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl p-6 md:p-8 border border-emerald-200/30">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl mb-3 md:mb-4">
            <span className="text-lg md:text-xl">📋</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            生產記錄管理
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            檢視與管理所有膠囊配方生產記錄，支援搜尋、篩選與匯出功能
          </p>
        </div>
      </div>

      <OrdersList />
      
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
    </div>
  )
}
