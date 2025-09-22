'use client'

import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'

export default function NewOrderPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[
        { label: '生產記錄管理', href: '/orders' },
        { label: '新增配方' }
      ]} />
      
      {/* Header Section */}
      <div className="text-center space-y-3 md:space-y-4 py-4 md:py-6">
        <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-3 md:mb-4">
          <span className="text-lg md:text-xl">➕</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          新增膠囊配方
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          建立新的膠囊配方生產記錄，包含原料配置與生產參數
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <ProductionOrderForm />
      </div>
      
      {/* 智能 AI 助手 */}
      <SmartAIAssistant />
    </div>
  )
}
