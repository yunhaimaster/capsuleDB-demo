'use client'

import { useState, useEffect } from 'react'
import { ResponsiveOrdersList } from '@/components/orders/responsive-orders-list'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { Card, CardContent } from '@/components/ui/card'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import Link from 'next/link'

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
    <div className="min-h-screen brand-logo-pattern-bg">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單', active: true },
          { href: '/orders/new', label: '新建' },
          { href: '/ai-recipe-generator', label: 'AI 配方' },
          { href: '/work-orders', label: '工作單' },
          { href: '/reports', label: '原料報表' },
          { href: '/history', label: '歷史' },
          { href: '/login?logout=true', label: '登出' }
        ]}
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">


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
    </div>
  )
}
