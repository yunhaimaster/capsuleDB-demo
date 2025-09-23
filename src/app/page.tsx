'use client'

import { useState, useEffect } from 'react'
import { InteractiveHero } from '@/components/ui/interactive-hero'
import { ProductionOrder } from '@/types'

export default function HomePage() {
  const [recentOrders, setRecentOrders] = useState<ProductionOrder[]>([])
  const [allOrders, setAllOrders] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentOrders()
    fetchAllOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=100')
      if (response.ok) {
        const data = await response.json()
        setAllOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching all orders:', error)
    }
  }

  const handleReveal = () => {
    // 當用戶完成拖拽時，可以執行一些額外的邏輯
    console.log('User revealed the content')
  }

  return (
    <div className="min-h-screen">
      <InteractiveHero onReveal={handleReveal} />
    </div>
  )
}