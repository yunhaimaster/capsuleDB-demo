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
      <div className="pt-20 px-4 sm:px-6 md:px-8 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-100 rounded-xl p-6 md:p-8 border border-indigo-200/30">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-3 md:mb-4">
            <span className="text-lg md:text-xl">➕</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            新增膠囊配方
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            建立新的膠囊配方生產記錄，包含原料配置與生產參數
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <ProductionOrderForm />
      </div>
      
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
