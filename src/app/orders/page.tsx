import { OrdersList } from '@/components/orders/orders-list'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: '生產記錄管理' }]} />
      
      {/* Header Section */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl mb-4">
          <span className="text-xl">📋</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          生產記錄管理
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          檢視與管理所有膠囊配方生產記錄，支援搜尋、篩選與匯出功能
        </p>
      </div>


      <OrdersList />
    </div>
  )
}
