'use client'

import { useState, useEffect } from 'react'
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
    <div className="min-h-screen brand-logo-bg-animation">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單', active: true },
          { href: '/orders/new', label: '新建' },
          { href: '/ai-recipe-generator', label: 'AI 配方' },
          { href: '/work-orders', label: '工作單' },
          { href: '/login?logout=true', label: '登出' }
        ]}
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-36 sm:pt-32 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">


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

      <LiquidGlassFooter />
      </div>
    </div>
  )
}
