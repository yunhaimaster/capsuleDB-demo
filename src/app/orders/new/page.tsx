'use client'

import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function NewOrderPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[
        { label: '生產記錄管理', href: '/orders' },
        { label: '新增配方' }
      ]} />
      
      {/* Header Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl mb-4">
          <span className="text-xl">➕</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          新增膠囊配方
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          建立新的膠囊配方生產記錄，包含原料配置與生產參數
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto">
        <ProductionOrderForm />
      </div>
    </div>
  )
}
