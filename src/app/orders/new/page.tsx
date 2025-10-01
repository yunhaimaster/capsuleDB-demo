'use client'

import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'

export default function NewOrderPage() {
  return (
    <div className="min-h-screen animated-gradient-bg-visible flex flex-col">
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">
        <section className="liquid-glass-card liquid-glass-card-refraction p-6 md:p-8">
          <div className="liquid-glass-content flex items-center gap-4">
            <div className="icon-container icon-container-pink shadow-[0_12px_30px_rgba(236,72,153,0.25)]">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-lg font-semibold text-[--brand-neutral]">建立新配方</h1>
              <p className="text-xs md:text-xs text-gray-600">輸入客戶、配方與原料資料以建立批次紀錄</p>
            </div>
          </div>
        </section>

        {/* Form Card */}
        <ProductionOrderForm />
      </div>

      {/* Footer */}
      <LiquidGlassFooter />
    </div>
  )
}
