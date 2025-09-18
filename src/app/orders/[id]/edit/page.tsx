'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProductionOrderForm } from '@/components/forms/production-order-form'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ProductionOrder } from '@/types'

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">找不到指定的訂單</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Breadcrumb items={[
        { label: '生產記錄管理', href: '/orders' },
        { label: '編輯配方' }
      ]} />
      
      {/* Header Section */}
      <div className="text-center space-y-3 md:space-y-4 py-4 md:py-6">
        <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mb-3 md:mb-4">
          <span className="text-lg md:text-xl">✏️</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          編輯膠囊配方
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          修改現有的膠囊配方生產記錄，更新原料配置與生產參數
        </p>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <ProductionOrderForm 
          initialData={order}
          orderId={order.id}
        />
      </div>
    </div>
  )
}
