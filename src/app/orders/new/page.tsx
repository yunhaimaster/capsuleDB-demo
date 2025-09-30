'use client'

import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'

export default function NewOrderPage() {
  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單' },
          { href: '/orders/new', label: '新建' }
        ]}
      />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-36 sm:pt-32 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">


      {/* Form Card */}
      <ProductionOrderForm />
      </div>
    </div>
  )
}
