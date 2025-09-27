'use client'

import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'

export default function NewOrderPage() {
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
      <div className="pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">

      {/* Form Card */}
      <ProductionOrderForm />
      
      {/* 智能 AI 助手 - 浮動按鈕 */}
      <SmartAIAssistant 
        orders={[]} 
        pageData={{
          currentPage: '/orders/new',
          pageDescription: '新增膠囊配方頁面 - 建立新的膠囊生產訂單',
          timestamp: new Date().toISOString(),
          ordersCount: 0,
          hasCurrentOrder: false,
          currentOrder: null,
          recentOrders: []
        }}
      />
      </div>
    </div>
  )
}
