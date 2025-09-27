'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { ProductionOrder } from '@/types'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'

export default function EditOrderPage() {
  const params = useParams()
  const [order, setOrder] = useState<ProductionOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch order')
        const data = await response.json()
        setOrder(data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">找不到指定的訂單</p>
      </div>
    )
  }

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
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <ProductionOrderForm 
          initialData={{
            customerName: order.customerName,
            productName: order.productName,
            productionQuantity: order.productionQuantity,
            completionDate: order.completionDate?.toISOString().split('T')[0] || '',
            processIssues: order.processIssues,
            qualityNotes: order.qualityNotes,
            capsuleColor: order.capsuleColor,
            capsuleSize: order.capsuleSize as "#1" | "#0" | "#00" | null,
            capsuleType: order.capsuleType as "明膠胃溶" | "植物胃溶" | "明膠腸溶" | "植物腸溶" | null,
            createdBy: order.createdBy,
            ingredients: order.ingredients
          }}
          orderId={order.id}
        />
      </div>
      </div>
    </div>
  )
}
