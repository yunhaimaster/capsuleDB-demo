'use client'

import { useState, useEffect } from 'react'
import { OrdersList } from '@/components/orders/orders-list'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="space-y-8">
      <Breadcrumb items={[{ label: '生產記錄管理' }]} />
      
      {/* Header Section */}
      <div className="text-center space-y-3 md:space-y-4 py-4 md:py-6">
        <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl mb-3 md:mb-4">
          <span className="text-lg md:text-xl">📋</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          生產記錄管理
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          檢視與管理所有膠囊配方生產記錄，支援搜尋、篩選與匯出功能
        </p>
      </div>

      <OrdersList />
      
             {/* 智能 AI 助手 */}
             <SmartAIAssistant orders={orders} />
    </div>
  )
}
