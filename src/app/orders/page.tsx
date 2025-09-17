import { OrdersList } from '@/components/orders/orders-list'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: '生產記錄管理' }]} />
      <div>
        <h1 className="text-3xl font-bold">生產記錄管理</h1>
        <p className="text-muted-foreground">
          檢視與管理所有膠囊配方生產記錄
        </p>
      </div>
      <OrdersList />
    </div>
  )
}
