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
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: '生產記錄管理', href: '/orders' },
        { label: '編輯配方' }
      ]} />
      <div>
        <h1 className="text-3xl font-bold">編輯膠囊配方</h1>
        <p className="text-muted-foreground">
          修改膠囊配方生產記錄
        </p>
      </div>
      <ProductionOrderForm 
        initialData={order}
        orderId={order.id}
      />
    </div>
  )
}
