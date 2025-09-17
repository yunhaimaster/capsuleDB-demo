'use client'

import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: '生產記錄管理', href: '/orders' },
        { label: '新增配方' }
      ]} />
      <div>
        <h1 className="text-3xl font-bold">新增膠囊配方</h1>
        <p className="text-muted-foreground">
          建立新的膠囊配方生產記錄
        </p>
      </div>
      <ProductionOrderForm />
    </div>
  )
}
